<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Al eliminar una cuenta (CU-26) se borraba en cascada todo lo que había cargado: noticias, eventos, galería,
 * vinculaciones, información académica y graduados. Ahora el contenido se conserva y queda sin autor
 * (user_id null), igual que en la revista INNOVAR. Las pantallas ya muestran «Desconocido» o nada si falta el autor.
 */
return new class extends Migration
{
    private const TABLAS = ['noticias', 'eventos', 'galerias', 'vinculaciones', 'informacion_academica', 'graduados'];

    public function up(): void
    {
        foreach (self::TABLAS as $tabla) {
            Schema::table($tabla, function (Blueprint $table) {
                $table->dropForeign(['user_id']);
            });
            Schema::table($tabla, function (Blueprint $table) {
                $table->unsignedBigInteger('user_id')->nullable()->change();
                $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        foreach (self::TABLAS as $tabla) {
            Schema::table($tabla, function (Blueprint $table) {
                $table->dropForeign(['user_id']);
            });
            Schema::table($tabla, function (Blueprint $table) {
                $table->unsignedBigInteger('user_id')->nullable(false)->change();
                $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            });
        }
    }
};
