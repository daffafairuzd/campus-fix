<?php

namespace App\Events;

use App\Models\Report;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReportSlaBreached implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Report $report) {}

    /**
     * Broadcast ke channel publik 'reports' — semua admin menerima update
     */
    public function broadcastOn(): array
    {
        return [new Channel('reports')];
    }

    public function broadcastAs(): string
    {
        return 'report.sla.breached';
    }

    public function broadcastWith(): array
    {
        return [
            'report_id'     => $this->report->id,
            'report_number' => $this->report->report_number,
            'title'         => $this->report->title,
            'status'        => $this->report->status,
            'priority'      => $this->report->priority,
        ];
    }
}
