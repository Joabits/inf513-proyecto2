<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * Datos de contacto y enlaces del portal (CU-28). Se muestran en el pie de todas las páginas
 * y en la página de contacto. "configuracion_contacto" tiene una sola fila;
 * redes y enlaces son listas que se muestran según "orden".
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('configuracion_contacto', function (Blueprint $table) {
            $table->id();
            $table->string('direccion', 160);
            $table->string('referencia', 160)->nullable();
            $table->string('ciudad', 80);
            $table->string('telefono', 40)->nullable();
            $table->string('whatsapp', 15)->nullable();
            $table->string('correo', 120)->nullable();
            $table->string('horario', 160)->nullable();
            $table->string('mapa_url', 500)->nullable();
            $table->timestamps();
        });

        Schema::create('configuracion_redes', function (Blueprint $table) {
            $table->id();
            $table->string('red', 20)->unique(); // facebook, instagram, tiktok, youtube, linkedin, x
            $table->string('url', 300);
            $table->unsignedSmallInteger('orden')->default(0);
            $table->timestamps();
        });

        Schema::create('configuracion_enlaces', function (Blueprint $table) {
            $table->id();
            $table->string('titulo', 60);
            $table->string('url', 300);
            $table->unsignedSmallInteger('orden')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('configuracion_enlaces');
        Schema::dropIfExists('configuracion_redes');
        Schema::dropIfExists('configuracion_contacto');
    }
};
