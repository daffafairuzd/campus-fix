<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\ReportAssignment;
use App\Models\ReportHistory;
use App\Models\Technician;
use App\Models\Notification;
use App\Models\User;
use App\Events\TechnicianAssigned;
use App\Services\FcmService;
use Illuminate\Http\Request;

class AssignmentController extends Controller
{
    /**
     * Daftar assignments aktif
     */
    public function index()
    {
        return response()->json(
            ReportAssignment::with(['report', 'technician', 'assignedBy'])
                ->where('is_active', true)
                ->orderByDesc('created_at')
                ->get()
        );
    }

    /**
     * Assign teknisi ke laporan (multi-teknisi support)
     */
    public function store(Request $request)
    {
        $request->validate([
            'report_id' => 'required|exists:reports,id',
            'technician_ids' => 'required|array|min:1',
            'technician_ids.*' => 'exists:users,id',
            'force_override' => 'boolean', // true = override kapasitas
        ]);

        $report = Report::findOrFail($request->report_id);
        $forceOverride = $request->boolean('force_override', false);
        $assignments = [];

        // Pre-check semua teknisi untuk mencegah assignment parsial
        foreach ($request->technician_ids as $techId) {
            $technician = Technician::where('user_id', $techId)->firstOrFail();

            if (!$forceOverride && $technician->workload_status === 'Sibuk') {
                return response()->json([
                    'message' => "Teknisi {$technician->user->name} sudah mencapai kapasitas maksimal. Lakukan Override untuk tetap menugaskan.",
                    'requires_override' => true,
                    'technician_id' => $techId,
                ], 422);
            }

            if ($technician->availability_status === 'cuti') {
                return response()->json([
                    'message' => "Teknisi {$technician->user->name} sedang cuti dan tidak dapat menerima tugas.",
                ], 422);
            }
        }

        // Proses assignment jika semua lolos pre-check
        foreach ($request->technician_ids as $techId) {
            $technician = Technician::where('user_id', $techId)->firstOrFail();

            // Nonaktifkan assignment lama untuk teknisi ini di laporan yang sama (jika ada)
            ReportAssignment::where('report_id', $report->id)
                ->where('technician_id', $techId)
                ->update(['is_active' => false]);

            $assignment = ReportAssignment::create([
                'report_id' => $report->id,
                'technician_id' => $techId,
                'assigned_by' => $request->user()->id,
                'is_active' => true,
                'is_force_override' => $forceOverride,
            ]);

            $assignments[] = $assignment;

            // Notifikasi ke teknisi
            Notification::create([
                'user_id' => $techId,
                'report_id' => $report->id,
                'type' => 'assignment',
                'title' => 'Penugasan Baru',
                'message' => "Anda ditugaskan untuk menangani laporan #{$report->report_number}: {$report->title}",
            ]);

            // Push notification FCM ke teknisi
            $teknisi = User::find($techId);
            if ($teknisi?->fcm_token) {
                app(FcmService::class)->send(
                    $teknisi->fcm_token,
                    'Penugasan Baru',
                    "Anda ditugaskan untuk menangani laporan #{$report->report_number}: {$report->title}",
                    ['report_id' => (string) $report->id, 'type' => 'assignment'],
                );
            }

            // Broadcast realtime ke teknisi
            broadcast(new TechnicianAssigned($report, $techId))->toOthers();
        }

        // Update status laporan ke ditugaskan jika masih menunggu
        if ($report->status === 'menunggu') {
            $report->update(['status' => 'ditugaskan']);

            // Broadcast realtime update status ke semua admin
            broadcast(new \App\Events\ReportStatusUpdated($report));

            // Notifikasi + FCM ke pelapor
            Notification::create([
                'user_id' => $report->reporter_id,
                'report_id' => $report->id,
                'type' => 'status_update',
                'title' => 'Status Laporan Diperbarui',
                'message' => "Laporan #{$report->report_number} kini berstatus: ditugaskan.",
            ]);

            $pelapor = User::find($report->reporter_id);
            if ($pelapor?->fcm_token) {
                app(FcmService::class)->send(
                    $pelapor->fcm_token,
                    'Status Laporan Diperbarui',
                    "Laporan #{$report->report_number} kini sedang ditugaskan kepada teknisi.",
                    ['report_id' => (string) $report->id, 'type' => 'status_update'],
                );
            }
        }

        // Tambah history
        $techNames = \App\Models\User::whereIn('id', $request->technician_ids)->pluck('name')->implode(', ');
        ReportHistory::create([
            'report_id' => $report->id,
            'user_id' => $request->user()->id,
            'title' => "Teknisi ditugaskan: {$techNames}" . ($forceOverride ? ' (Override Kapasitas)' : ''),
        ]);

        return response()->json([
            'message' => 'Penugasan berhasil.',
            'assignments' => $assignments,
        ], 201);
    }

    /**
     * Hapus assignment (unassign teknisi)
     */
    public function destroy(ReportAssignment $assignment)
    {
        $assignment->update(['is_active' => false]);

        ReportHistory::create([
            'report_id' => $assignment->report_id,
            'user_id' => request()->user()->id,
            'title' => "Penugasan dihapus: {$assignment->technician->name}",
        ]);

        return response()->json(['message' => 'Penugasan dihapus.']);
    }
}
