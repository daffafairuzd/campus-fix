<?php

namespace App\Events;

use App\Models\Report;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TechnicianAssigned implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Report $report,
        public int    $technicianId
    ) {}

    /**
     * Broadcast ke private channel teknisi yang ditugaskan
     */
    public function broadcastOn(): array
    {
        return [new PrivateChannel("user.{$this->technicianId}")];
    }

    public function broadcastAs(): string
    {
        return 'technician.assigned';
    }

    public function broadcastWith(): array
    {
        return [
            'report_id'     => $this->report->id,
            'report_number' => $this->report->report_number,
            'title'         => $this->report->title,
            'priority'      => $this->report->priority,
            'location'      => $this->report->location,
            'sla_deadline'  => $this->report->sla_deadline?->toDateTimeString(),
        ];
    }
}
