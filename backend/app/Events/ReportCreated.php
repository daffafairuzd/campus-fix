<?php

namespace App\Events;

use App\Models\Report;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReportCreated implements ShouldBroadcast
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
        return 'report.created';
    }

    public function broadcastWith(): array
    {
        return [
            'report_id'     => $this->report->id,
            'report_number' => $this->report->report_number,
            'title'         => $this->report->title,
            'priority'      => $this->report->priority,
            'reporter_name' => $this->report->reporter ? $this->report->reporter->name : 'Anonim',
            'created_at'    => $this->report->created_at->toDateTimeString(),
        ];
    }
}
