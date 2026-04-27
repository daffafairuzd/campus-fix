<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\ReportHistory;
use App\Models\ReportPhoto;
use App\Models\SlaConfig;
use App\Models\Notification;
use App\Models\User;
use App\Events\ReportCreated;
use App\Events\ReportStatusUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $query = Report::with(['reporter', 'activeTechnicians', 'histories'])
            ->when($request->status,   fn($q) => $q->where('status', $request->status))
            ->when($request->priority, fn($q) => $q->where('priority', $request->priority))
            ->when($request->category, fn($q) => $q->where('category', $request->category))
            ->when($request->search,   fn($q) => $q->where(function($q2) use ($request) {
                $q2->where('title', 'ilike', "%{$request->search}%")
                   ->orWhere('report_number', 'ilike', "%{$request->search}%")
                   ->orWhere('location', 'ilike', "%{$request->search}%");
            }));

        $sortBy = $request->sort_by ?? 'created_at';
        $sortDir = $request->sort_dir ?? 'desc';

        if ($sortBy === 'priority') {
            $query->orderByRaw("CASE priority WHEN 'kritis' THEN 4 WHEN 'tinggi' THEN 3 WHEN 'sedang' THEN 2 ELSE 1 END DESC");
        } elseif ($sortBy === 'sla_deadline') {
            $query->orderBy('sla_deadline', 'asc');
        } else {
            $query->orderBy('created_at', $sortDir);
        }

        return response()->json($query->paginate(20));
    }

    public function show(Report $report)
    {
        return response()->json(
            $report->load(['reporter', 'activeTechnicians', 'histories.user', 'slaConfig'])
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'category'    => 'required|string',
            'location'    => 'required|string',
            'building'    => 'nullable|string',
            'floor'       => 'nullable|string',
            'priority'    => 'required|in:kritis,tinggi,sedang,rendah',
            'photo_urls'  => 'nullable|array',
            'latitude'    => 'nullable|numeric',
            'longitude'   => 'nullable|numeric',
        ]);

        // Hitung SLA deadline berdasarkan priority config
        $slaConfig   = SlaConfig::forPriority($validated['priority']);
        $slaDeadline = $slaConfig
            ? Carbon::now()->addHours($slaConfig->resolution_hours)
            : Carbon::now()->addDays(7);

        $report = Report::create([
            ...$validated,
            'reporter_id'  => $request->user()->id,
            'status'       => 'menunggu',
            'sla_deadline' => $slaDeadline,
        ]);

        // Tambah history entry pertama
        ReportHistory::create([
            'report_id' => $report->id,
            'user_id'   => $request->user()->id,
            'title'     => 'Laporan dibuat',
        ]);

        // 1. Broadcast realtime event (ke channel 'reports')
        broadcast(new ReportCreated($report->load('reporter')));

        // 2. Simpan notifikasi ke semua admin
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            Notification::create([
                'user_id'   => $admin->id,
                'report_id' => $report->id,
                'type'      => 'new_report',
                'title'     => 'Laporan Baru Masuk',
                'message'   => "Terdapat laporan baru #{$report->report_number}: {$report->title}",
            ]);
        }

        return response()->json($report->load('reporter'), 201);
    }

    public function update(Request $request, Report $report)
    {
        $validated = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'category'    => 'sometimes|string',
            'location'    => 'sometimes|string',
            'priority'    => 'sometimes|in:kritis,tinggi,sedang,rendah',
            'latitude'    => 'nullable|numeric',
            'longitude'   => 'nullable|numeric',
            'photo_urls'  => 'nullable|array',
        ]);

        $report->update($validated);
        return response()->json($report->fresh()->load(['reporter', 'activeTechnicians']));
    }

    // ── Photo endpoints ──────────────────────────────────────────────────────

    /**
     * List semua foto laporan
     */
    public function photos(Report $report)
    {
        $photos = $report->photos()
            ->select('id', 'report_id', 'original_name', 'mime_type', 'type', 'photo_data', 'created_at')
            ->get();
        return response()->json($photos);
    }

    /**
     * Upload foto (base64 data URI) ke tabel report_photos di PostgreSQL
     */
    public function uploadPhoto(Request $request, Report $report)
    {
        $request->validate([
            'photo_data'    => 'required|string',
            'original_name' => 'nullable|string|max:255',
            'mime_type'     => 'nullable|string|max:50',
            'type'          => 'nullable|in:bukti_laporan,bukti_penyelesaian',
        ]);

        if ($report->photos()->count() >= 5) {
            return response()->json(['message' => 'Maksimal 5 foto per laporan.'], 422);
        }

        $photo = $report->photos()->create([
            'uploader_id'   => $request->user()->id,
            'photo_data'    => $request->photo_data,
            'original_name' => $request->original_name,
            'mime_type'     => $request->mime_type,
            'type'          => $request->type ?? 'bukti_laporan',
        ]);

        return response()->json($photo, 201);
    }

    /**
     * Hapus foto dari laporan
     */
    public function deletePhoto(Request $request, Report $report, ReportPhoto $photo)
    {
        if ($photo->report_id !== $report->id) {
            return response()->json(['message' => 'Foto tidak ditemukan di laporan ini.'], 404);
        }

        $photo->delete();
        return response()->json(['message' => 'Foto berhasil dihapus.']);
    }

    public function destroy(Report $report)
    {
        $report->delete();
        return response()->json(['message' => 'Laporan dihapus.']);
    }

    /**
     * Update status laporan + tambah history + broadcast Reverb
     */
    public function updateStatus(Request $request, Report $report)
    {
        $request->validate([
            'status'      => 'required|in:menunggu,dalam_proses,selesai,eskalasi',
            'description' => 'nullable|string',
        ]);

        $oldStatus = $report->status;
        $newStatus = $request->status;

        $updateData = ['status' => $newStatus];

        if ($newStatus === 'selesai')   $updateData['closed_at']    = now();
        if ($newStatus === 'eskalasi')  $updateData['escalated_at'] = now();

        $report->update($updateData);

        // Tambah history
        ReportHistory::create([
            'report_id'   => $report->id,
            'user_id'     => $request->user()->id,
            'title'       => "Status diubah: {$oldStatus} → {$newStatus}",
            'description' => $request->description,
        ]);

        // Broadcast realtime ke semua admin
        broadcast(new ReportStatusUpdated($report));

        // Notifikasi ke pelapor
        Notification::create([
            'user_id'   => $report->reporter_id,
            'report_id' => $report->id,
            'type'      => 'status_update',
            'title'     => 'Status Laporan Diperbarui',
            'message'   => "Laporan #{$report->report_number} kini berstatus: {$newStatus}.",
        ]);

        return response()->json($report->fresh()->load(['reporter', 'activeTechnicians', 'histories.user']));
    }

    /**
     * Submit rating laporan selesai
     */
    public function rate(Request $request, Report $report)
    {
        $request->validate([
            'rating'        => 'required|integer|min:1|max:5',
            'feedback_text' => 'nullable|string|max:500',
        ]);

        if ($report->reporter_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $report->update([
            'rating'        => $request->rating,
            'feedback_text' => $request->feedback_text,
        ]);

        return response()->json(['message' => 'Rating berhasil disimpan.']);
    }
}
