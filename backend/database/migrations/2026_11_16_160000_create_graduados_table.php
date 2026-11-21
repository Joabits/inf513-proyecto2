<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('graduados', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_completo', 255);
            $table->string('ci', 20)->unique();
            $table->string('correo')->nullable();
            $table->string('telefono', 20)->nullable();
            $table->string('gestion_ingreso');
            $table->string('gestion_egreso');
            $table->string('modalidad');
            $table->text('titulo_tema')->nullable();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('graduados');
    }
};
