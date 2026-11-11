<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * Investigación de la Carrera (CU-19; la página pública es CU-03).
 *  - investigacion_lineas: las líneas de investigación. Un proyecto no deja borrar su línea.
 *  - investigacion_proyectos: proyectos de investigación, de aula (PIA) y de semilleros.
 *  - investigacion_semilleros: áreas de los semilleros de investigación.
 *  - investigacion_contenido: textos de semilleros y PIA (una sola fila).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('investigacion_lineas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 160);
            $table->text('descripcion');
            $table->unsignedSmallInteger('orden')->default(0);
            $table->timestamps();
        });

        Schema::create('investigacion_proyectos', function (Blueprint $table) {
            $table->id();
            $table->string('titulo', 200);
            $table->string('tipo', 20)->index(); // investigacion, aula (PIA), semillero
            $table->foreignId('linea_id')->nullable()->constrained('investigacion_lineas')->restrictOnDelete();
            $table->string('responsable', 160);
            $table->string('integrantes', 500)->nullable();
            $table->unsignedSmallInteger('gestion');
            $table->string('estado', 20)->default('en_curso'); // en_curso, concluido
            $table->text('resumen');
            $table->boolean('publicado')->default(true);
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('investigacion_semilleros', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 120);
            $table->string('descripcion', 300)->nullable();
            $table->unsignedSmallInteger('orden')->default(0);
            $table->timestamps();
        });

        Schema::create('investigacion_contenido', function (Blueprint $table) {
            $table->id();
            $table->text('semilleros_presentacion')->nullable();
            $table->text('semilleros_mision')->nullable();
            $table->text('semilleros_vision')->nullable();
            $table->text('semilleros_objetivos')->nullable(); // un objetivo por línea
            $table->string('semilleros_coordinador', 160)->nullable();
            $table->text('pia_presentacion')->nullable();
            $table->text('instituto')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('investigacion_contenido');
        Schema::dropIfExists('investigacion_semilleros');
        Schema::dropIfExists('investigacion_proyectos');
        Schema::dropIfExists('investigacion_lineas');
    }
};
