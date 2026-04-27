<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\SlaConfig;
use Illuminate\Http\Request;

class SlaController extends Controller
{
    public function index()
    {
        $activeReports = Report::with(['reporter', 'activeTechnicians', 'slaConfig'])
            ->whereNotIn('status', ['selesai'])
            ->orderBy('sla_deadline', 'asc')
            ->get();

        $now = now();

        $slaData = $activeReports->map(function ($report) use ($now) {
            $slaDeadline = $report->sla_deadline;
            $createdAt   = $report->created_at;

            $totalMs  = $slaDeadline ? $slaDeadline->timestamp - $createdAt->timestamp : 0;
            $passedMs = $slaDeadline ? $now->timestamp - $createdAt->timestamp : 0;

            $percentage = $totalMs > 0 ? min(100, max(0, ($passedMs / $totalMs) * 100)) : 0;

            $warningLevel = 'safe';
            if ($percentage > 75) $warningLevel = 'warning';
            if ($percentage > 95) $warningLevel = 'danger';
            if ($slaDeadline && $slaDeadline->isPast()) $warningLevel = 'expired';

            $hoursLeft = $slaDeadline ? round($now->diffInHours($slaDeadline, false)) : null;
            $timeText  = $hoursLeft === null
                ? 'Tidak ada deadline'
                : ($hoursLeft > 24
                    ? floor($hoursLeft / 24) . ' Hari lagi'
                    : ($hoursLeft >= 0 ? "{$hoursLeft} Jam lagi" : 'Telat ' . abs($hoursLeft) . ' Jam'));

            return [
                'id'              => $report->id,
                'report_number'   => $report->report_number,
                'title'           => $report->title,
                'status'          => $report->status,
                'priority'        => $report->priority,
                'sla_deadline'    => $slaDeadline?->toDateTimeString(),
                'percentage'      => round($percentage, 1),
                'warning_level'   => $warningLevel,
                'time_text'       => $timeText,
                'technicians'     => $report->activeTechnicians->pluck('name'),
                'sla_config'      => $report->slaConfig,
                'escalated_at'    => $report->escalated_at?->toDateTimeString(),
            ];
        });

        // Summary stats
        $slaConfigAll = SlaConfig::all();
        $totalSelesai = Report::where('status', 'selesai')
            ->whereMonth('created_at', now()->month)
            ->count();
        $totalBulanIni = Report::whereMonth('created_at', now()->month)->count();
        $compliance = $totalBulanIni > 0 ? round(($totalSelesai / $totalBulanIni) * 100) : 0;

        return response()->json([
            'sla_tracking' => $slaData,
            'sla_configs'  => $slaConfigAll,
            'summary'      => [
                'safe'        => $slaData->where('warning_level', 'safe')->count(),
                'warning'     => $slaData->whereIn('warning_level', ['warning', 'danger'])->count(),
                'expired'     => $slaData->where('warning_level', 'expired')->count(),
                'compliance'  => $compliance,
            ],
        ]);
    }
}
