<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * Revista Académica Institucional INNOVAR (CU-21). "revista" tiene una sola fila (presentación y normas
 * para colaboradores); cada edición agrupa sus artículos. Los PDF van al disco privado y solo salen por la API,
 * así una edición sin publicar no queda expuesta por su dirección; la portada es una imagen del disco público.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('revista', function (Blueprint $table) {
            $table->id();
            $table->text('presentacion');
            $table->text('colaboradores')->nullable();
            $table->timestamps();
        });

        Schema::create('revista_ediciones', function (Blueprint $table) {
            $table->id();
            $table->unsignedSmallInteger('volumen')->nullable();
            $table->unsignedSmallInteger('numero');
            $table->unsignedSmallInteger('anio');
            $table->string('titulo', 160)->nullable();
            $table->text('descripcion')->nullable();
            $table->string('portada')->nullable();
            $table->string('archivo')->nullable();
            $table->string('archivo_nombre')->nullable();
            $table->unsignedInteger('archivo_tamano')->nullable();
            // Una edición nueva es un borrador: publicarla es una decisión aparte
            $table->boolean('publicada')->default(false);
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['anio', 'numero']);
        });

        Schema::create('revista_articulos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('edicion_id')->constrained('revista_ediciones')->cascadeOnDelete();
            $table->string('titulo', 200);
            $table->string('autores', 300);
            $table->text('resumen')->nullable();
            $table->string('archivo')->nullable();
            $table->string('archivo_nombre')->nullable();
            $table->unsignedInteger('archivo_tamano')->nullable();
            $table->unsignedSmallInteger('orden')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('revista_articulos');
        Schema::dropIfExists('revista_ediciones');
        Schema::dropIfExists('revista');
    }
};
