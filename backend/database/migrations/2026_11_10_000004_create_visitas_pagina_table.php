<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Contador de visitas por página (req. 7) y recursos más accedidos (req. 4 y 8)
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visitas_pagina', function (Blueprint $table) {
            $table->id();
            $table->string('pagina', 150)->unique();
            $table->unsignedBigInteger('total')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visitas_pagina');
    }
};
