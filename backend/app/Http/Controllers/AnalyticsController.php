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
    public function overview(Request $request)
    {
        $now    = now();
        $period = $request->query('period', 'bulan_ini'); // bulan_ini | tahun_ini

        $query = Report::query();
        if ($period === 'bulan_ini') {
            $query->whereMonth('created_at', $now->month)->whereYear('created_at', $now->year);
        } else {
            $query->whereYear('created_at', $now->year);
        }

        $total        = (clone $query)->count();
        $dalamProses  = (clone $query)->where('status', 'dalam_proses')->count();
        $selesai      = (clone $query)->where('status', 'selesai')->count();
        $eskalasi     = (clone $query)->where('status', 'eskalasi')->count();
        $menunggu     = (clone $query)->where('status', 'menunggu')->count();

        $compliance = $total > 0 ? round(($selesai / $total) * 100) : 0;

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
            'period'         => $period,
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

    /**
     * Mendapatkan daftar pelapor paling aktif
     */
    public function topReporters()
    {
        $top = \App\Models\User::where('role', 'pelapor')
            ->withCount('reports')
            ->orderByDesc('reports_count')
            ->limit(5)
            ->get()
            ->map(fn($u) => [
                'name'  => $u->name,
                'count' => $u->reports_count,
            ]);

        return response()->json($top);
    }

    /**
     * Statistik tambahan untuk Heatmap, SLA, dan CSAT
     */
    public function advancedStats(Request $request)
    {
        $now    = now();
        $period = $request->query('period', 'bulan_ini');

        // Base query scoped by period
        $scopedQuery = Report::query();
        if ($period === 'bulan_ini') {
            $scopedQuery->whereMonth('created_at', $now->month)->whereYear('created_at', $now->year);
        } else {
            $scopedQuery->whereYear('created_at', $now->year);
        }

        // 1. Heatmap (kept for API compat)
        $heatmap = (clone $scopedQuery)->select(
                DB::raw("CASE WHEN building IS NULL OR building = '' THEN 'Lokasi Tidak Set' ELSE building END as building_name"), 
                'category', 
                DB::raw('count(*) as total')
            )
            ->groupBy('building_name', 'building', 'category')
            ->get();

        // 2. SLA Ratio: Hit vs Miss (Overall)
        $totalSelesai = (clone $scopedQuery)->where('status', 'selesai')->count();
        $slaHit = (clone $scopedQuery)->where('status', 'selesai')
            ->whereColumn('closed_at', '<=', 'sla_deadline')
            ->count();
        $slaMiss = $totalSelesai - $slaHit;

        $allCategories = ['HVAC', 'Listrik', 'Lab', 'Plumbing', 'Jaringan', 'Lift', 'Lainnya'];

        // 2b. SLA Ratio Per Category
        $slaCategoriesRaw = (clone $scopedQuery)->where('status', 'selesai')
            ->select('category', 
                DB::raw('count(*) as total_selesai'),
                DB::raw('SUM(CASE WHEN closed_at <= sla_deadline THEN 1 ELSE 0 END) as hit')
            )
            ->groupBy('category')
            ->get()
            ->keyBy('category');
            
        $slaCategories = collect($allCategories)->map(function ($cat) use ($slaCategoriesRaw) {
            $item = $slaCategoriesRaw->get($cat);
            if ($item) {
                $miss = $item->total_selesai - $item->hit;
                $percentage = $item->total_selesai > 0 ? round(($item->hit / $item->total_selesai) * 100) : 0;
                return [
                    'category' => $cat,
                    'chart' => [
                        ['name' => 'Tepat Waktu', 'value' => (int) $item->hit],
                        ['name' => 'Terlambat', 'value' => (int) $miss],
                    ],
                    'percentage' => $percentage
                ];
            } else {
                return [
                    'category' => $cat,
                    'chart' => [
                        ['name' => 'Tepat Waktu', 'value' => 0],
                        ['name' => 'Terlambat', 'value' => 0],
                    ],
                    'percentage' => 0
                ];
            }
        });

        // 3. Customer Satisfaction (CSAT)
        $csatQuery = (clone $scopedQuery)->whereNotNull('rating');
        $csatRaw = (clone $csatQuery)
            ->select('rating', DB::raw('count(*) as count'))
            ->groupBy('rating')
            ->orderBy('rating', 'desc')
            ->get();
        $avgRating = (clone $csatQuery)->avg('rating');

        // 3b. CSAT Per Category
        $csatCategoriesRaw = (clone $csatQuery)
            ->select('category', DB::raw('AVG(rating) as avg_rating'))
            ->groupBy('category')
            ->get()
            ->keyBy('category');
            
        $csatCategories = collect($allCategories)->map(function ($cat) use ($csatCategoriesRaw) {
            $item = $csatCategoriesRaw->get($cat);
            return [
                'category' => $cat,
                'average' => $item ? round($item->avg_rating, 1) : 0
            ];
        });

        // 4. Bottlenecks
        $bottlenecksRaw = (clone $scopedQuery)->where('status', 'selesai')
            ->select('category', 
                DB::raw('AVG(EXTRACT(EPOCH FROM (closed_at - created_at))) / 7200 as waiting'),
                DB::raw('AVG(EXTRACT(EPOCH FROM (closed_at - created_at))) / 3600 as process')
            )
            ->groupBy('category')
            ->get()
            ->keyBy('category');

        $bottlenecks = collect($allCategories)->map(function ($cat) use ($bottlenecksRaw) {
            $item = $bottlenecksRaw->get($cat);
            return [
                'category' => $cat,
                'waiting'  => $item ? round($item->waiting, 1) : 0,
                'process'  => $item ? round($item->process, 1) : 0
            ];
        });

        // 5. Distribusi Prioritas
        $priorities = (clone $scopedQuery)->select('priority', DB::raw('count(*) as total'))
            ->groupBy('priority')
            ->get()
            ->map(fn($p) => [
                'name'  => ucfirst($p->priority),
                'value' => $p->total,
            ]);

        // 6. Categories Stats
        $categoriesStats = (clone $scopedQuery)->select('category', DB::raw('count(*) as total'))
            ->groupBy('category')
            ->orderByDesc('total')
            ->get();

        return response()->json([
            'heatmap'     => $heatmap,
            'sla'         => [
                'overall' => [
                    'chart' => [
                        ['name' => 'Tepat Waktu', 'value' => $slaHit],
                        ['name' => 'Terlambat', 'value' => $slaMiss],
                    ],
                    'percentage' => $totalSelesai > 0 ? round(($slaHit / $totalSelesai) * 100) : 0
                ],
                'per_category' => $slaCategories
            ],
            'csat'        => [
                'overall' => [
                    'distribution' => $csatRaw,
                    'average'      => round($avgRating ?? 0, 1)
                ],
                'per_category' => $csatCategories
            ],
            'bottlenecks' => $bottlenecks,
            'priorities'  => $priorities,
            'categories_stats' => $categoriesStats,
        ]);
    }
}
