<?php

namespace App\Http\Controllers;

use App\Models\Technician;
use App\Models\User;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TechnicianController extends Controller
{
    public function index()
    {
        $technicians = Technician::with('user')->get()->map(function ($t) {
            $activeCount   = $t->active_count;
            $workloadStatus = $t->workload_status;

            return [
                'id'                  => $t->id,
                'user_id'             => $t->user_id,
                'name'                => $t->user->name,
                'email'               => $t->user->email,
                'avatar'              => strtoupper(substr($t->user->name, 0, 1) . (str_contains($t->user->name, ' ') ? substr(strrchr($t->user->name, ' '), 1, 1) : '')),
                'specialty'           => $t->specialty,
                'availability_status' => $t->availability_status,
                'workload_status'     => $workloadStatus,
                'active_count'        => $activeCount,
                'max_capacity'        => $t->max_capacity,
                'completed_count'     => $t->completed_count,
                'rating_avg'          => $t->rating_avg,
                'load_percentage'     => $t->max_capacity > 0 ? min(100, ($activeCount / $t->max_capacity) * 100) : 0,
            ];
        });

        return response()->json($technicians);
    }

    public function update(Request $request, Technician $technician)
    {
        $validated = $request->validate([
            'specialty'           => 'sometimes|string',
            'availability_status' => 'sometimes|in:aktif,cuti',
            'max_capacity'        => 'sometimes|integer|min:1|max:20',
        ]);

        $technician->update($validated);
        return response()->json($technician->fresh()->load('user'));
    }

    public function myPerformance(Request $request)
    {
        $user = $request->user();
        $technician = $user->technician;

        if (!$technician) {
            return response()->json(['message' => 'Not a technician'], 403);
        }

        // Query laporan yang di-assign ke teknisi ini (via report_assignments)
        $assignedReportIds = \App\Models\ReportAssignment::where('technician_id', $user->id)
            ->pluck('report_id');

        // Hitung SLA tepat waktu vs terlambat
        $onTimeCount = Report::whereIn('id', $assignedReportIds)
            ->where('status', 'selesai')
            ->whereNotNull('closed_at')
            ->whereNotNull('sla_deadline')
            ->whereColumn('closed_at', '<=', 'sla_deadline')
            ->count();

        $lateCount = Report::whereIn('id', $assignedReportIds)
            ->where('status', 'selesai')
            ->whereNotNull('closed_at')
            ->whereNotNull('sla_deadline')
            ->whereColumn('closed_at', '>', 'sla_deadline')
            ->count();

        // Hitung rata-rata resolusi (jam)
        $avgResolutionTime = Report::whereIn('id', $assignedReportIds)
            ->where('status', 'selesai')
            ->whereNotNull('closed_at')
            ->selectRaw('AVG(EXTRACT(EPOCH FROM (closed_at - created_at))/3600) as avg_hours')
            ->value('avg_hours');
        
        $avgResFormatted = $avgResolutionTime ? round($avgResolutionTime, 1) . ' Jam' : '-';

        // Hitung mingguan (7 hari terakhir)
        $weeklyData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date  = now()->subDays($i);
            $dayName = $date->isoFormat('ddd');

            $selesai = Report::whereIn('id', $assignedReportIds)
                ->where('status', 'selesai')
                ->whereDate('closed_at', $date->toDateString())
                ->count();

            $weeklyData[] = [
                'day'     => $dayName,
                'selesai' => $selesai,
            ];
        }

        $completedCount = Report::whereIn('id', $assignedReportIds)
            ->where('status', 'selesai')
            ->count();

        $ratingAvg = Report::whereIn('id', $assignedReportIds)
            ->whereNotNull('rating')
            ->avg('rating') ?? 0;

        return response()->json([
            'completed_count' => $completedCount,
            'rating_avg'      => round($ratingAvg, 1),
            'on_time_count'   => $onTimeCount,
            'late_count'      => $lateCount,
            'avg_resolution'  => $avgResFormatted,
            'weekly_data'     => $weeklyData,
        ]);
    }
}
