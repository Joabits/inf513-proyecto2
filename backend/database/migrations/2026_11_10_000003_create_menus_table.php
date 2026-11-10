<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * Menú dinámico (req. 2). Las opciones públicas no tienen permiso;
 * las de gestión se muestran solo si el rol activo tiene su permiso (normalmente "<recurso>.ver").
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('menus')->cascadeOnDelete();
            $table->foreignId('permiso_id')->nullable()->constrained('permisos')->nullOnDelete();
            $table->string('titulo', 80);
            $table->string('ruta', 120)->nullable();           // ruta de React; null si solo agrupa
            $table->string('seccion', 20)->default('publico'); // publico | gestion
            $table->unsignedSmallInteger('orden')->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menus');
    }
};
