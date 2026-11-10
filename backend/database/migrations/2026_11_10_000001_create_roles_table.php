<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Roles fijos del sistema. Se cargan con RolSeeder y no tienen CRUD.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 40)->unique();   // director, editor_institucional, editor_comunicacion, usuario
            $table->string('nombre', 80);
            $table->string('descripcion')->nullable();
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('rol_id')->nullable()->after('id')->constrained('roles')->nullOnDelete();
            $table->boolean('activo')->default(true)->after('password');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('rol_id');
            $table->dropColumn('activo');
        });
        Schema::dropIfExists('roles');
    }
};
