<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\ReportAssignment;
use App\Models\ReportHistory;
use App\Models\Technician;
use App\Models\Notification;
use App\Events\TechnicianAssigned;
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
            'report_id'      => 'required|exists:reports,id',
            'technician_ids' => 'required|array|min:1',
            'technician_ids.*' => 'exists:users,id',
            'force_override' => 'boolean', // true = override kapasitas
        ]);

        $report      = Report::findOrFail($request->report_id);
        $forceOverride = $request->boolean('force_override', false);
        $assignments = [];

        foreach ($request->technician_ids as $techId) {
            // Cek apakah teknisi ada dan aktif
            $technician = Technician::where('user_id', $techId)->firstOrFail();

            // Cek kapasitas (kecuali force override)
            if (!$forceOverride && $technician->workload_status === 'Sibuk') {
                return response()->json([
                    'message'        => "Teknisi {$technician->user->name} sudah mencapai kapasitas ({$technician->max_capacity} tugas). Gunakan force_override=true untuk tetap assign.",
                    'requires_override' => true,
                    'technician_id'  => $techId,
                ], 422);
            }

            if ($technician->availability_status === 'cuti') {
                return response()->json([
                    'message' => "Teknisi {$technician->user->name} sedang cuti dan tidak dapat menerima tugas.",
                ], 422);
            }

            // Nonaktifkan assignment lama untuk teknisi ini di laporan yang sama (jika ada)
            ReportAssignment::where('report_id', $report->id)
                ->where('technician_id', $techId)
                ->update(['is_active' => false]);

            $assignment = ReportAssignment::create([
                'report_id'         => $report->id,
                'technician_id'     => $techId,
                'assigned_by'       => $request->user()->id,
                'is_active'         => true,
                'is_force_override' => $forceOverride,
            ]);

            $assignments[] = $assignment;

            // Notifikasi ke teknisi
            Notification::create([
                'user_id'   => $techId,
                'report_id' => $report->id,
                'type'      => 'assignment_new',
                'title'     => 'Penugasan Baru',
                'message'   => "Anda ditugaskan untuk menangani laporan #{$report->report_number}: {$report->title}",
            ]);

            // Broadcast realtime ke teknisi
            broadcast(new TechnicianAssigned($report, $techId))->toOthers();
        }

        // Update status laporan ke dalam_proses jika masih menunggu
        if ($report->status === 'menunggu') {
            $report->update(['status' => 'dalam_proses']);
        }

        // Tambah history
        $techNames = \App\Models\User::whereIn('id', $request->technician_ids)->pluck('name')->implode(', ');
        ReportHistory::create([
            'report_id' => $report->id,
            'user_id'   => $request->user()->id,
            'title'     => "Teknisi ditugaskan: {$techNames}" . ($forceOverride ? ' (Override Kapasitas)' : ''),
        ]);

        return response()->json([
            'message'     => 'Penugasan berhasil.',
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
            'user_id'   => request()->user()->id,
            'title'     => "Penugasan dihapus: {$assignment->technician->name}",
        ]);

        return response()->json(['message' => 'Penugasan dihapus.']);
    }
}
