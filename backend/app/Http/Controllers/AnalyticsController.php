<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\Technician;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    /**
     * Overview stats untuk dashboard
     */
    public function overview()
    {
        $now        = now();
        $startMonth = $now->copy()->startOfMonth();

        $total        = Report::whereMonth('created_at', $now->month)->count();
        $dalamProses  = Report::where('status', 'dalam_proses')->count();
        $selesai      = Report::where('status', 'selesai')->whereMonth('created_at', $now->month)->count();
        $eskalasi     = Report::where('status', 'eskalasi')->count();
        $menunggu     = Report::where('status', 'menunggu')->count();

        // SLA compliance bulan ini
        $compliance = $total > 0 ? round(($selesai / $total) * 100) : 0;

        // Laporan mendekati SLA (belum selesai, deadline < 2 hari lagi)
        $slaAlert = Report::whereNotIn('status', ['selesai'])
            ->where('sla_deadline', '<=', $now->copy()->addDays(2))
            ->count();

        return response()->json([
            'total_laporan'  => $total,
            'dalam_proses'   => $dalamProses,
            'selesai'        => $selesai,
            'eskalasi'       => $eskalasi,
            'menunggu'       => $menunggu,
            'sla_compliance' => $compliance,
            'sla_alert'      => $slaAlert,
        ]);
    }

    /**
     * Data chart mingguan (7 hari terakhir)
     */
    public function weekly()
    {
        $days = [];
        for ($i = 6; $i >= 0; $i--) {
            $date  = now()->subDays($i);
            $dayName = $date->isoFormat('ddd'); // Sen, Sel, ...

            $days[] = [
                'day'    => $dayName,
                'laporan'=> Report::whereDate('created_at', $date->toDateString())->count(),
                'selesai'=> Report::where('status', 'selesai')->whereDate('closed_at', $date->toDateString())->count(),
            ];
        }

        return response()->json($days);
    }

    /**
     * Data chart bulanan (6 bulan terakhir)
     */
    public function monthly()
    {
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $date   = now()->subMonths($i);
            $months[] = [
                'month'  => $date->isoFormat('MMM'),
                'laporan'=> Report::whereYear('created_at', $date->year)->whereMonth('created_at', $date->month)->count(),
                'selesai'=> Report::where('status', 'selesai')->whereYear('created_at', $date->year)->whereMonth('created_at', $date->month)->count(),
            ];
        }

        return response()->json($months);
    }

    /**
     * Breakdown per kategori
     */
    public function categories()
    {
        $data = Report::select('category', DB::raw('count(*) as total'))
            ->whereMonth('created_at', now()->month)
            ->groupBy('category')
            ->orderByDesc('total')
            ->get();

        $grandTotal = $data->sum('total');

        return response()->json($data->map(fn($d) => [
            'category'   => $d->category,
            'total'      => $d->total,
            'percentage' => $grandTotal > 0 ? round(($d->total / $grandTotal) * 100) : 0,
        ]));
    }

    /**
     * Performa teknisi
     */
    public function technicianPerformance()
    {
        $technicians = Technician::with('user')
            ->orderByDesc('completed_count')
            ->limit(10)
            ->get()
            ->map(fn($t) => [
                'name'            => $t->user->name,
                'completed_count' => $t->completed_count,
                'rating_avg'      => $t->rating_avg,
                'active_count'    => $t->active_count,
                'workload_status' => $t->workload_status,
            ]);

        return response()->json($technicians);
    }
}
