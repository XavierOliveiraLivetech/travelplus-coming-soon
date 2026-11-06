<?php

namespace App\Http\Controllers;

use App\Models\Registo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RegistoController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'agencia' => ['required', 'string', 'max:255'],
            'telefone' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:registos,email'],
        ]);

        $registo = Registo::create([
            'agencia' => $validated['agencia'],
            'telefone' => $validated['telefone'],
            'email' => $validated['email'],
            'estado' => 'Por contactar',
        ]);

        return response()->json([
            'message' => 'Registo criado com sucesso.',
            'data' => $registo,
        ], 201);
    }
}
