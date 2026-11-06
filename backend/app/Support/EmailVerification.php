<?php

namespace App\Support;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Support\Facades\URL;

class EmailVerification
{
    public static function url(MustVerifyEmail $user): string
    {
        return URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes((int) config('auth.verification.expire', 60)),
            [
                'id' => $user->id,
                'hash' => sha1($user->getEmailForVerification()),
            ],
        );
    }
}
