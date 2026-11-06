<?php

use App\Http\Controllers\RegistoController;
use Illuminate\Support\Facades\Route;

Route::post('/registos', [RegistoController::class, 'store']);
