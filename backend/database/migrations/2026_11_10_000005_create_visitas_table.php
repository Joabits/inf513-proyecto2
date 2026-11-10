<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * Contador de visitas (req. 7) y datos para el dashboard (req. 8).
 *   visitas         -> una fila por visita (página, fecha, IP, usuario)
 *   visitas_pagina  -> total por página; lo mantiene un TRIGGER de la BD (ver migración de triggers)
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visitas', function (Blueprint $table) {
            $table->id();
            $table->string('pagina', 150)->index();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('ip', 45)->nullable();
            $table->timestamp('created_at')->useCurrent()->index();
        });

        Schema::create('visitas_pagina', function (Blueprint $table) {
            $table->id();
            $table->string('pagina', 150)->unique();
            $table->unsignedBigInteger('total')->default(0);
            $table->timestamp('ultima_visita')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visitas_pagina');
        Schema::dropIfExists('visitas');
    }
};
