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
        $query = Report::with(['reporter', 'activeTechnicians', 'assignments.technician', 'histories', 'photos'])
            // Filter berdasarkan role
            ->when($request->user()->isReporter(), function($q) use ($request) {
                return $q->where('reporter_id', $request->user()->id);
            })
            ->when($request->user()->isTechnician(), function($q) use ($request) {
                return $q->whereHas('activeTechnicians', function($q2) use ($request) {
                    $q2->where('users.id', $request->user()->id);
                });
            })
            // Filter request
            ->when($request->status,   fn($q) => $q->where('status', $request->status))
            ->when($request->priority, fn($q) => $q->where('priority', $request->priority))
            ->when($request->category, fn($q) => $q->where('category', $request->category))
            ->when($request->has('is_analyzed'), fn($q) => $q->where('is_analyzed', filter_var($request->is_analyzed, FILTER_VALIDATE_BOOLEAN)))
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
            // NULLS LAST: laporan tanpa SLA (belum ditentukan prioritas) tampil di paling bawah
            $query->orderByRaw('sla_deadline ASC NULLS LAST');
        } else {
            $query->orderBy('created_at', $sortDir);
        }

        $perPage = $request->get('per_page', 10);
        return response()->json($query->paginate($perPage));
    }

    public function show(Report $report)
    {
        return response()->json(
            $report->load(['reporter', 'activeTechnicians', 'assignments.technician', 'histories.user', 'slaConfig', 'photos'])
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
            'photo_urls'  => 'nullable|array',
            'latitude'    => 'nullable|numeric',
            'longitude'   => 'nullable|numeric',
        ]);

        $report = Report::create([
            ...$validated,
            'reporter_id'  => $request->user()->id,
            'status'       => 'menunggu',
            'priority'     => 'belum_ditentukan',
            'sla_deadline' => null, // SLA determined later by Admin
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
            'priority'    => 'sometimes|in:belum_ditentukan,kritis,tinggi,sedang,rendah',
            'latitude'    => 'nullable|numeric',
            'longitude'   => 'nullable|numeric',
            'photo_urls'  => 'nullable|array',
        ]);

        $report->update($validated);
        return response()->json($report->fresh()->load(['reporter', 'activeTechnicians', 'assignments.technician']));
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
        \Log::info('Upload photo attempt for report: ' . $report->id, $request->except('photo_data'));
        
        $validator = \Validator::make($request->all(), [
            'photo_data'    => 'required|string',
            'original_name' => 'nullable|string|max:255',
            'mime_type'     => 'nullable|string|max:50',
            'type'          => 'nullable|in:bukti_laporan,bukti_penyelesaian',
        ]);

        if ($validator->fails()) {
            \Log::error('Validation failed for photo upload', $validator->errors()->toArray());
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        if ($report->photos()->count() >= 5) {
            return response()->json(['message' => 'Maksimal 5 foto per laporan.'], 422);
        }

        $photo = $report->photos()->create([
            'uploader_id'   => $request->user()?->id,
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
            'status'      => 'required|in:menunggu,ditugaskan,assessment,dalam_proses,selesai,eskalasi',
            'description' => 'nullable|string',
        ]);

        $oldStatus = $report->status;
        $newStatus = $request->status;

        // Validasi Alur Transisi Status Baru
        $allowedTransitions = [
            'menunggu' => ['ditugaskan'],
            'ditugaskan' => ['assessment'],
            'assessment' => ['dalam_proses', 'eskalasi'],
            'dalam_proses' => ['selesai', 'eskalasi'],
            'eskalasi' => ['dalam_proses'], // Aturan Ketat 1: Wajib kembali ke dalam_proses
            'selesai' => [] // Selesai adalah status akhir
        ];

        if (!isset($allowedTransitions[$oldStatus]) || !in_array($newStatus, $allowedTransitions[$oldStatus])) {
            return response()->json([
                'message' => "Transisi status dari " . ucfirst(str_replace('_', ' ', $oldStatus)) . " ke " . ucfirst(str_replace('_', ' ', $newStatus)) . " tidak diperbolehkan."
            ], 422);
        }

        if ($oldStatus === 'assessment' && $newStatus === 'dalam_proses') {
            if (empty($request->description)) {
                return response()->json([
                    'message' => 'Catatan asesmen (description) wajib diisi sebelum mulai pengerjaan.'
                ], 422);
            }
        }

        $updateData = ['status' => $newStatus];

        if ($newStatus === 'selesai') {
            // Aturan Ketat 2: Transisi dari dalam_proses ke selesai wajib menyertakan validasi pelampiran bukti foto
            $hasPhotoProof = $report->photos()->where('type', 'bukti_penyelesaian')->exists();
            if (!$hasPhotoProof) {
                return response()->json([
                    'message' => 'Anda wajib mengunggah foto bukti penyelesaian terlebih dahulu sebelum menyelesaikan laporan.'
                ], 422);
            }
            $updateData['closed_at'] = now();
        }

        if ($newStatus === 'eskalasi') {
            $updateData['escalated_at'] = now();
            $updateData['is_escalation_requested'] = false;
            $updateData['escalation_reason'] = null;
        }

        // Resume SLA logic
        if ($oldStatus === 'eskalasi' && $newStatus === 'dalam_proses' && $report->escalated_at) {
            $diffSeconds = now()->diffInSeconds($report->escalated_at);
            if ($report->sla_deadline) {
                $updateData['sla_deadline'] = $report->sla_deadline->addSeconds($diffSeconds);
            }
            $updateData['escalated_at'] = null;
        }

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

        return response()->json($report->fresh()->load(['reporter', 'activeTechnicians', 'assignments.technician', 'histories.user']));
    }

    /**
     * Submit rating laporan selesai
     */
    public function rate(Request $request, Report $report)
    {
        $validated = $request->validate([
            'rating'   => 'required|integer|min:1|max:5',
            'feedback' => 'nullable|string|max:500',
        ]);

        if ((int) $report->reporter_id !== (int) $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $report->update([
            'rating'        => $validated['rating'],
            'feedback_text' => $validated['feedback'],
        ]);

        // Catat ke riwayat laporan
        ReportHistory::create([
            'report_id'   => $report->id,
            'user_id'     => $request->user()->id,
            'title'       => "Pelapor memberikan rating: {$validated['rating']}/5",
            'description' => $validated['feedback'] ?: 'Pelapor memberikan penilaian terhadap penanganan laporan.',
        ]);

        return response()->json(['message' => 'Rating berhasil disimpan.']);
    }

    /**
     * Verifikasi prioritas laporan oleh admin
     */
    public function verifyPriority(Request $request, Report $report)
    {
        $request->validate([
            'priority' => 'required|in:kritis,tinggi,sedang,rendah',
        ]);

        // Hitung SLA deadline berdasarkan priority config yang baru diset admin
        $slaConfig   = SlaConfig::forPriority($request->priority);
        $slaDeadline = $slaConfig
            ? Carbon::now()->addHours($slaConfig->resolution_hours)
            : Carbon::now()->addDays(7);

        $report->update([
            'priority'    => $request->priority,
            'is_analyzed' => true,
            'sla_deadline' => $slaDeadline,
        ]);

        ReportHistory::create([
            'report_id'   => $report->id,
            'user_id'     => $request->user()->id,
            'title'       => 'Prioritas diverifikasi',
            'description' => "Admin menentukan tingkat prioritas: " . ucfirst($request->priority),
        ]);

        return response()->json(['message' => 'Prioritas berhasil diverifikasi.', 'report' => $report->fresh()->load(['reporter', 'activeTechnicians', 'assignments.technician', 'histories.user'])]);
    }

    /**
     * Pengajuan eskalasi oleh teknisi
     */
    public function requestEscalation(Request $request, Report $report)
    {
        $request->validate([
            'reason' => 'required|string',
        ]);

        $report->update([
            'is_escalation_requested' => true,
            'escalation_reason'       => $request->reason,
        ]);

        ReportHistory::create([
            'report_id'   => $report->id,
            'user_id'     => $request->user()->id,
            'title'       => 'Mengajukan Eskalasi',
            'description' => $request->reason,
        ]);

        // Beri notifikasi ke Admin
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            Notification::create([
                'user_id'   => $admin->id,
                'report_id' => $report->id,
                'type'      => 'status_update',
                'title'     => 'Pengajuan Eskalasi',
                'message'   => "Teknisi mengajukan eskalasi untuk laporan #{$report->report_number}. Menunggu persetujuan Anda.",
            ]);
        }

        return response()->json(['message' => 'Pengajuan eskalasi berhasil dikirim.', 'report' => $report->fresh()->load(['reporter', 'activeTechnicians', 'assignments.technician', 'histories.user'])]);
    }

    /**
     * Penolakan eskalasi oleh admin
     */
    public function rejectEscalation(Request $request, Report $report)
    {
        $report->update([
            'is_escalation_requested' => false,
            'escalation_reason'       => null,
        ]);

        ReportHistory::create([
            'report_id'   => $report->id,
            'user_id'     => $request->user()->id,
            'title'       => 'Pengajuan Eskalasi Ditolak',
            'description' => 'Admin menolak pengajuan eskalasi. Silakan lanjutkan pengerjaan.',
        ]);

        return response()->json(['message' => 'Pengajuan eskalasi ditolak.', 'report' => $report->fresh()->load(['reporter', 'activeTechnicians', 'assignments.technician', 'histories.user'])]);
    }
}
