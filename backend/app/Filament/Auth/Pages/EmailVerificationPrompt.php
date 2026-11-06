<?php

namespace App\Filament\Auth\Pages;

use App\Support\EmailVerification;
use Filament\Auth\Notifications\VerifyEmail;
use Filament\Auth\Pages\EmailVerification\EmailVerificationPrompt as BaseEmailVerificationPrompt;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use LogicException;

class EmailVerificationPrompt extends BaseEmailVerificationPrompt
{
    protected function sendEmailVerificationNotification(MustVerifyEmail $user): void
    {
        if ($user->hasVerifiedEmail()) {
            return;
        }

        if (! method_exists($user, 'notify')) {
            $userClass = $user::class;

            throw new LogicException("Model [{$userClass}] does not have a [notify()] method.");
        }

        $notification = app(VerifyEmail::class);
        $notification->url = EmailVerification::url($user);

        $user->notify($notification);
    }
}
