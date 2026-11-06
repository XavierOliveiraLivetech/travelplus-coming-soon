<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('registos', function (Blueprint $table) {
            $table->id();
            $table->string('email');
            $table->string('nome')->nullable();
            $table->string('telefone')->nullable();
            $table->string('whatsapp')->nullable();
            $table->enum('estado', ['Por contactar', 'Contactado', 'Rejeitado']);
            $table->string('motivo_rejeicao')->nullable();
            $table->enum('meio_contacto', ['WhatsApp', 'Telefone', 'Email'])->nullable();
            $table->string('colaborador')->nullable();
            $table->dateTime('data_contactado')->nullable();
            $table->dateTime('data_rejeitado')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registos');
    }
};
