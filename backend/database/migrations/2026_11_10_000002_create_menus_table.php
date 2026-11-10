<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Menú dinámico (req. 2) y matriz de acceso rol x opción de menú (req. 4)
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('menus')->cascadeOnDelete();
            $table->string('titulo', 80);
            $table->string('ruta', 120)->nullable();      // ruta de React; null si solo agrupa
            $table->string('seccion', 20)->default('publico'); // publico | gestion
            $table->unsignedSmallInteger('orden')->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        Schema::create('rol_menu', function (Blueprint $table) {
            $table->foreignId('rol_id')->constrained('roles')->cascadeOnDelete();
            $table->foreignId('menu_id')->constrained('menus')->cascadeOnDelete();
            $table->primary(['rol_id', 'menu_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rol_menu');
        Schema::dropIfExists('menus');
    }
};
