<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * Contenido administrable de la portada (CU-12). "inicio_portada" tiene una sola fila;
 * las demás tablas son listas que se muestran según "orden".
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inicio_portada', function (Blueprint $table) {
            $table->id();
            $table->string('distintivo', 80)->nullable();
            $table->string('titulo', 120);
            $table->text('presentacion');
            $table->string('director_nombre', 120);
            $table->string('director_cargo', 120);
            $table->text('director_mensaje');
            $table->string('director_foto')->nullable();
            $table->timestamps();
        });

        Schema::create('inicio_banners', function (Blueprint $table) {
            $table->id();
            $table->string('imagen');
            $table->string('texto_alternativo', 200);
            $table->string('enlace', 200)->nullable();
            $table->unsignedSmallInteger('orden')->default(0);
            $table->timestamps();
        });

        Schema::create('inicio_cifras', function (Blueprint $table) {
            $table->id();
            $table->string('valor', 20);
            $table->string('etiqueta', 60);
            $table->unsignedSmallInteger('orden')->default(0);
            $table->timestamps();
        });

        Schema::create('inicio_accesos', function (Blueprint $table) {
            $table->id();
            $table->string('titulo', 60);
            $table->string('descripcion', 160);
            $table->string('ruta', 200);
            $table->unsignedSmallInteger('orden')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inicio_accesos');
        Schema::dropIfExists('inicio_cifras');
        Schema::dropIfExists('inicio_banners');
        Schema::dropIfExists('inicio_portada');
    }
};
