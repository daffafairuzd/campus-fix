<?php

namespace App\Services;

use Kreait\Firebase\Contract\Messaging;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;
use Kreait\Firebase\Messaging\AndroidConfig;
use Illuminate\Support\Facades\Log;
use Throwable;

class FcmService
{
    public function __construct(private Messaging $messaging) {}

    public function send(string $fcmToken, string $title, string $body, array $data = []): void
    {
        try {
            $message = CloudMessage::new()
                ->toToken($fcmToken)
                ->withNotification(Notification::create($title, $body))
                ->withAndroidConfig(AndroidConfig::fromArray([
                    'notification' => [
                        'channel_id' => 'campus_fix_channel_v2',
                        'sound'      => 'default',
                    ],
                ]))
                ->withData($data);

            $this->messaging->send($message);
        } catch (Throwable $e) {
            Log::warning('FCM send failed: ' . $e->getMessage());
        }
    }
}
