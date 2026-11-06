<?php

namespace App\Filament\Resources\Users\Pages;

use App\Filament\Resources\Users\UserResource;
use App\Notifications\VerifyEmail;
use App\Support\EmailVerification;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Model;

class CreateUser extends CreateRecord
{
    protected static string $resource = UserResource::class;

    protected function afterCreate(): void
    {
        $this->sendEmailVerificationNotification($this->getRecord());
    }

    protected function sendEmailVerificationNotification(Model $user): void
    {
        if (! $user instanceof MustVerifyEmail) {
            return;
        }

        if ($user->hasVerifiedEmail()) {
            return;
        }

        $notification = app(VerifyEmail::class);
        $notification->url = EmailVerification::url($user);

        $user->notify($notification);
    }
}
