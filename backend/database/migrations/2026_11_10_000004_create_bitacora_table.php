<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * Bitácora de auditoría (req. 4 y RF-19). Tipos:
 *   ingreso_ok, ingreso_fallido, salida  -> inicios de sesión (con IP)
 *   accion     -> lo que hace un usuario en un módulo (crear, editar, eliminar...)
 *   acceso     -> cada llamada a la API (para "recursos más accedidos")
 *   auditoria  -> cambios en tablas sensibles, escritos por triggers de PostgreSQL
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bitacora', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('tipo', 20)->index();
            $table->string('accion', 40)->nullable();
            $table->string('recurso', 150)->nullable()->index();
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
