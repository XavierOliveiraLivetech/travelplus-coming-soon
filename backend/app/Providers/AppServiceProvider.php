<?php

namespace App\Providers;

use App\Notifications\VerifyEmail;
use Filament\Auth\Notifications\VerifyEmail as FilamentVerifyEmail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Envia de imediato (sem depender de queue:work)
        $this->app->bind(FilamentVerifyEmail::class, VerifyEmail::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Garante que links assinados usam sempre o mesmo host do APP_URL
        URL::forceRootUrl(config('app.url'));
    }
}
