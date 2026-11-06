<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as BaseNotification;

class VerifyEmail extends BaseNotification
{
    public string $url;

    protected function verificationUrl(mixed $notifiable): string
    {
        return $this->url;
    }
}
