<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * Plan de estudios y malla curricular. CU-02 los consulta; los administra
 * «Gestionar información académica» (CU-16).
 *  - malla_plan: datos generales del plan vigente (una sola fila).
 *  - malla_materias: materias por semestre. Las «optativas» del último semestre son
 *    opciones de graduación: el estudiante elige una sola.
 *  - malla_prerrequisitos: qué materias hay que aprobar antes de cursar otra.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('malla_plan', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 20);
            $table->string('nivel', 60);
            $table->string('sistema', 60);
            $table->unsignedTinyInteger('semestres');
            $table->text('titulaciones')->nullable(); // una titulación intermedia por línea
            $table->text('nota_graduacion')->nullable();
            $table->timestamps();
        });

        Schema::create('malla_materias', function (Blueprint $table) {
            $table->id();
            $table->string('sigla', 10)->unique();
            $table->string('nombre', 120);
            $table->unsignedTinyInteger('semestre')->index();
            $table->unsignedTinyInteger('horas_teoricas')->nullable();
            $table->unsignedTinyInteger('horas_practicas')->nullable();
            $table->unsignedTinyInteger('creditos')->nullable();
            $table->boolean('optativa')->default(false);
            $table->unsignedSmallInteger('orden')->default(0);
            $table->timestamps();
        });

        Schema::create('malla_prerrequisitos', function (Blueprint $table) {
            $table->foreignId('materia_id')->constrained('malla_materias')->cascadeOnDelete();
            $table->foreignId('prerrequisito_id')->constrained('malla_materias')->cascadeOnDelete();
            $table->primary(['materia_id', 'prerrequisito_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('malla_prerrequisitos');
        Schema::dropIfExists('malla_materias');
        Schema::dropIfExists('malla_plan');
    }
};
