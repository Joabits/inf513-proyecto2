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
        // "clave" es el nombre sin mayúsculas ni tildes: impide crear «reglamentos» si ya existe «Reglamentos»
        Schema::create('documento_categorias', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 60);
            $table->string('clave', 60)->unique();
            $table->timestamps();
        });

        Schema::create('documentos', function (Blueprint $table) {
            $table->id();
            $table->string('titulo', 160);
            $table->string('descripcion', 300)->nullable();
            $table->foreignId('categoria_id')->constrained('documento_categorias')->restrictOnDelete();
            $table->string('archivo');
            $table->string('nombre_original');
            $table->string('tipo', 4);
            $table->string('mime', 100);
            $table->unsignedInteger('tamano');
            $table->boolean('publicado')->default(true);
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('documento_versiones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('documento_id')->constrained('documentos')->cascadeOnDelete();
            $table->string('archivo');
            $table->string('nombre_original');
            $table->string('tipo', 4);
            $table->string('mime', 100);
            $table->unsignedInteger('tamano');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documento_versiones');
        Schema::dropIfExists('documentos');
        Schema::dropIfExists('documento_categorias');
    }
};
