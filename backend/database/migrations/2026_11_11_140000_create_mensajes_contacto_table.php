<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * Mensajes que envían los visitantes desde la página de contacto (CU-08).
 * Los atiende el personal en el panel (CU-25): por eso el estado empieza en "nuevo".
 * La IP y el navegador ayudan a detectar envíos abusivos.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mensajes_contacto', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 120);
            $table->string('correo', 120);
            $table->string('telefono', 40)->nullable();
            $table->string('asunto', 120);
            $table->text('mensaje');
            $table->string('estado', 20)->default('nuevo')->index(); // nuevo, leido, respondido, archivado (CU-25)
            $table->string('ip', 45)->nullable();
            $table->string('navegador')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mensajes_contacto');
    }
};
