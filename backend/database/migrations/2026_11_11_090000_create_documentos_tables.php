<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * Documentos descargables (CU-17). El archivo vive en el disco privado y solo se entrega por la API,
 * así un documento oculto no queda expuesto por su URL. Al reemplazar el archivo,
 * el anterior pasa a "documento_versiones" para conservar el historial.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documentos', function (Blueprint $table) {
            $table->id();
            $table->string('titulo', 160);
            $table->string('descripcion', 300)->nullable();
            $table->string('categoria', 60)->index();
            $table->string('archivo');
            $table->string('nombre_original');
            $table->string('tipo', 4);
            $table->unsignedInteger('tamano');
            $table->boolean('publicado')->default(true);
            $table->timestamps();
        });

        Schema::create('documento_versiones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('documento_id')->constrained('documentos')->cascadeOnDelete();
            $table->string('archivo');
            $table->string('nombre_original');
            $table->string('tipo', 4);
            $table->unsignedInteger('tamano');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documento_versiones');
        Schema::dropIfExists('documentos');
    }
};
