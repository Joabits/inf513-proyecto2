<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Bitácora (req. 4 y RF-19): ingresos aceptados, fallidos y acciones sobre contenidos
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bitacora', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('tipo', 20)->index();      // ingreso_ok | ingreso_fallido | salida | accion
            $table->string('accion', 40)->nullable(); // crear | modificar | publicar | eliminar ...
            $table->string('recurso', 120)->nullable(); // p. ej. "Noticia #12"
            $table->string('detalle')->nullable();
            $table->string('ip', 45)->nullable();
            $table->string('navegador')->nullable();
            $table->timestamp('created_at')->useCurrent()->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bitacora');
    }
};
