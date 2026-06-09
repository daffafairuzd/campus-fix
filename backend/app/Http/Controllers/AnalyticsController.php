<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    private function applyPeriodScope($query, $period, $now)
    {
        if ($period === '7_hari') {
            $query->where('created_at', '>=', $now->copy()->subDays(7));
        } elseif ($period === '4_minggu') {
            $query->where('created_at', '>=', $now->copy()->subWeeks(4));
        } elseif ($period === '6_bulan') {
            $query->where('created_at', '>=', $now->copy()->subMonths(6));
        }
        return $query;
    }

    public function overview(Request $request)
    {
        $now = now();
        $period = $request->query('period', '7_hari');

        $query = Report::query();

        $total = (clone $query)->count();

        // Dynamic status count via GROUP BY — always accurate
        $statusCounts = (clone $query)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        $selesai = $statusCounts['selesai'] ?? 0;
        $compliance = $total > 0 ? round(($selesai / $total) * 100) : 0;

        $slaAlert = Report::whereNotIn('status', ['selesai'])
            ->where('sla_deadline', '<=', $now->copy()->addDays(2))
            ->count();

        return response()->json([
            'total_laporan' => $total,
            'dalam_proses' => $statusCounts['dalam_proses'] ?? 0,
            'selesai' => $selesai,
            'eskalasi' => $statusCounts['eskalasi'] ?? 0,
            'menunggu' => $statusCounts['menunggu'] ?? 0,
            'ditugaskan' => $statusCounts['ditugaskan'] ?? 0,
            'assessment' => $statusCounts['assessment'] ?? 0,
            'status_distribution' => $statusCounts,
            'sla_compliance' => $compliance,
            'sla_alert' => $slaAlert,
            'period' => $period,
        ]);
    }

    public function chart(Request $request)
    {
        $period = $request->query('period', '7_hari');
        $data = [];

        if ($period === '7_hari') {
            for ($i = 6; $i >= 0; $i--) {
                $date = now()->subDays($i);
                $dayName = $date->isoFormat('ddd');

                $data[] = [
                    'label' => $dayName,
                    'laporan' => Report::whereDate('created_at', $date->toDateString())->count(),
                    'selesai' => Report::where('status', 'selesai')->whereDate('closed_at', $date->toDateString())->count(),
                ];
            }
        } elseif ($period === '4_minggu') {
            for ($i = 3; $i >= 0; $i--) {
                $startOfWeek = now()->subWeeks($i)->startOfWeek();
                $endOfWeek = now()->subWeeks($i)->endOfWeek();
                $data[] = [
                    'label' => 'Mg ' . (4 - $i),
                    'laporan' => Report::whereBetween('created_at', [$startOfWeek, $endOfWeek])->count(),
                    'selesai' => Report::where('status', 'selesai')->whereBetween('closed_at', [$startOfWeek, $endOfWeek])->count(),
                ];
            }
        } elseif ($period === '6_bulan') {
            for ($i = 5; $i >= 0; $i--) {
                $date = now()->subMonths($i);
                $data[] = [
                    'label' => $date->isoFormat('MMM'),
                    'laporan' => Report::whereYear('created_at', $date->year)->whereMonth('created_at', $date->month)->count(),
                    'selesai' => Report::where('status', 'selesai')->whereYear('closed_at', $date->year)->whereMonth('closed_at', $date->month)->count(),
                ];
            }
        }

        return response()->json($data);
    }

    public function categories()
    {
        $data = Report::select('category', DB::raw('count(*) as total'))
            ->whereMonth('created_at', now()->month)
            ->groupBy('category')
            ->orderByDesc('total')
            ->get();

        $grandTotal = $data->sum('total');

        return response()->json($data->map(fn($d) => [
            'category' => $d->category,
            'total' => $d->total,
            'percentage' => $grandTotal > 0 ? round(($d->total / $grandTotal) * 100) : 0,
        ]));
    }

    public function advancedStats(Request $request)
    {
        $now = now();
        $period = $request->query('period', '7_hari');

        $scopedQuery = Report::query();

        // 1. SLA Ratio: Hit vs Miss (Overall)
        $baseQueryForSla = (clone $scopedQuery)->where(function($q) use ($now) {
            $q->where('status', 'selesai')
              ->orWhere(function($q2) use ($now) {
                  $q2->where('status', '!=', 'selesai')
                     ->where('sla_deadline', '<', $now);
              });
        });

        $totalSlaRelevant = (clone $baseQueryForSla)->count();
        $slaHit = (clone $baseQueryForSla)->where('status', 'selesai')
            ->whereColumn('closed_at', '<=', 'sla_deadline')
            ->count();
        $slaMiss = $totalSlaRelevant - $slaHit;

        $allCategories = ['HVAC', 'Listrik', 'Lab', 'Plumbing', 'Jaringan', 'Lift', 'Lainnya'];

        // 1b. SLA Ratio Per Category
        $slaCategoriesRaw = (clone $scopedQuery)->where(function($q) use ($now) {
                $q->where('status', 'selesai')
                  ->orWhere(function($q2) use ($now) {
                      $q2->where('status', '!=', 'selesai')
                         ->where('sla_deadline', '<', $now);
                  });
            })
            ->select(
                'category',
                DB::raw('count(*) as total_relevant'),
                DB::raw('SUM(CASE WHEN status = \'selesai\' AND closed_at <= sla_deadline THEN 1 ELSE 0 END) as hit')
            )
            ->groupBy('category')
            ->get()
            ->keyBy('category');

        $slaCategories = collect($allCategories)->map(function ($cat) use ($slaCategoriesRaw) {
            $item = $slaCategoriesRaw->get($cat);
            if ($item) {
                $miss = $item->total_relevant - $item->hit;
                $percentage = $item->total_relevant > 0 ? round(($item->hit / $item->total_relevant) * 100) : 0;
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

        // 2. Customer Satisfaction (CSAT)
        $csatQuery = (clone $scopedQuery)->whereNotNull('rating');
        $csatRaw = (clone $csatQuery)
            ->select('rating', DB::raw('count(*) as count'))
            ->groupBy('rating')
            ->orderBy('rating', 'desc')
            ->get();
        $avgRating = (clone $csatQuery)->avg('rating');

        // 2b. CSAT Per Category
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

        // 3. Bottlenecks
        $bottlenecksRaw = (clone $scopedQuery)->where('status', 'selesai')
            ->select(
                'category',
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
                'waiting' => $item ? round($item->waiting, 1) : 0,
                'process' => $item ? round($item->process, 1) : 0
            ];
        });

        // 4. Distribusi Prioritas
        $priorities = (clone $scopedQuery)->select('priority', DB::raw('count(*) as total'))
            ->groupBy('priority')
            ->get()
            ->map(fn($p) => [
                'name' => ucfirst($p->priority),
                'value' => $p->total,
            ]);

        // 5. Categories Stats
        $categoriesStats = (clone $scopedQuery)->select('category', DB::raw('count(*) as total'))
            ->groupBy('category')
            ->orderByDesc('total')
            ->get();

        return response()->json([
            'sla' => [
                'overall' => [
                    'chart' => [
                        ['name' => 'Tepat Waktu', 'value' => $slaHit],
                        ['name' => 'Terlambat', 'value' => $slaMiss],
                    ],
                    'percentage' => $totalSlaRelevant > 0 ? round(($slaHit / $totalSlaRelevant) * 100) : 0
                ],
                'per_category' => $slaCategories
            ],
            'csat' => [
                'overall' => [
                    'distribution' => $csatRaw,
                    'average' => round($avgRating ?? 0, 1)
                ],
                'per_category' => $csatCategories
            ],
            'bottlenecks' => $bottlenecks,
            'priorities' => $priorities,
            'categories_stats' => $categoriesStats,
        ]);
    }

    public function dashboard(Request $request)
    {
        $overview = $this->overview($request)->getData(true);
        $chart = $this->chart($request)->getData(true);
        $advanced = $this->advancedStats($request)->getData(true);

        return response()->json([
            'overview' => $overview,
            'chart' => $chart,
            'advanced' => $advanced,
        ]);
    }
}
