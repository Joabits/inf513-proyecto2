<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * Información institucional de la Carrera (CU-27): una sola fila con los textos de «La Carrera»
 * y una lista de hitos para la línea de tiempo de su historia.
 * Los textos se guardan sin HTML: cada línea en blanco separa un párrafo.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('institucional', function (Blueprint $table) {
            $table->id();
            $table->text('presentacion');
            $table->text('resena_historica');
            $table->text('mision');
            $table->text('vision');
            $table->text('perfil_profesional');
            $table->text('campo_ocupacional');
            $table->date('fecha_creacion')->nullable();
            $table->string('resolucion', 120)->nullable();
            $table->string('acreditacion', 160)->nullable();
            $table->timestamps();
        });

        Schema::create('institucional_hitos', function (Blueprint $table) {
            $table->id();
            $table->unsignedSmallInteger('anio');
            $table->string('titulo', 120);
            $table->string('descripcion', 300)->nullable();
            $table->unsignedSmallInteger('orden')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('institucional_hitos');
        Schema::dropIfExists('institucional');
    }
};
