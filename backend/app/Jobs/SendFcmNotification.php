<?php

namespace App\Jobs;

use App\Services\FcmService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendFcmNotification implements ShouldQueue
{
    use Queueable;

    public $fcmToken;
    public $title;
    public $body;
    public $data;

    /**
     * Create a new job instance.
     */
    public function __construct(string $fcmToken, string $title, string $body, array $data = [])
    {
        $this->fcmToken = $fcmToken;
        $this->title = $title;
        $this->body = $body;
        $this->data = $data;
    }

    /**
     * Execute the job.
     */
    public function handle(FcmService $fcmService): void
    {
        $fcmService->send($this->fcmToken, $this->title, $this->body, $this->data);
    }
}
