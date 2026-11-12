<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * Autoridades, personal administrativo y docentes de la Carrera (CU-24).
 * Una sola tabla: lo que distingue a cada persona es su grupo. La foto es opcional
 * porque la Carrera todavía no las entregó; se guarda la ruta relativa del disco público.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('personal_carrera', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 160);
            $table->string('cargo', 160);
            $table->string('grupo', 20)->index();
            $table->string('foto')->nullable();
            $table->unsignedSmallInteger('orden')->default(0);
            $table->boolean('visible')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personal_carrera');
    }
};
