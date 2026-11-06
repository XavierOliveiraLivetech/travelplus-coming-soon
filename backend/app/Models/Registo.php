<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Registo extends Model
{
    protected $table = 'registos';
    protected $fillable = [
        'email',
        'nome',
        'agencia',
        'telefone',
        'whatsapp',
        'estado',
        'motivo_rejeicao',
        'meio_contacto',
        'colaborador',
        'data_contactado',
        'data_rejeitado',
        'observacoes',
    ];

    protected function casts(): array
    {
        return [
            'data_contactado' => 'date',
            'data_rejeitado' => 'date',
        ];
    }
}
