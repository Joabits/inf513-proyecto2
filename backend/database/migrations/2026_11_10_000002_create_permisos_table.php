<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * Matriz de acceso (req. 2 y 4): qué ACCIONES puede hacer cada rol sobre cada RECURSO.
 * Un permiso es "recurso.accion", por ejemplo "noticias.crear".
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permisos', function (Blueprint $table) {
            $table->id();
            $table->string('recurso', 40);   // noticias, usuarios, bitacora...
            $table->string('accion', 20);    // ver, crear, editar, eliminar, exportar
            $table->string('slug', 64)->unique(); // noticias.crear
            $table->string('descripcion')->nullable();
            $table->timestamps();
            $table->unique(['recurso', 'accion']);
        });

        Schema::create('rol_permiso', function (Blueprint $table) {
            $table->foreignId('rol_id')->constrained('roles')->cascadeOnDelete();
            $table->foreignId('permiso_id')->constrained('permisos')->cascadeOnDelete();
            $table->primary(['rol_id', 'permiso_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rol_permiso');
        Schema::dropIfExists('permisos');
    }
};
