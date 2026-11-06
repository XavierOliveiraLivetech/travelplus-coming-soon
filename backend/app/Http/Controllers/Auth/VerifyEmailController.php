<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class VerifyEmailController extends Controller
{
    public function __invoke(Request $request, string $id, string $hash)
    {
        $user = User::findOrFail($id);

        if (! hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            abort(403);
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();

            event(new Verified($user));
        }

        if (Filament::auth()->check()) {
            return redirect()->intended(Filament::getUrl());
        }

        return redirect()->to(Filament::getLoginUrl())
            ->with('status', __('Email verificado com sucesso. Pode iniciar sessão.'));
    }
}
