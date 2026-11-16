<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mensajes_contacto', function (Blueprint $table) {
            $table->boolean('atendido')->default(false)->after('estado');
            $table->text('respuesta')->nullable()->after('atendido');
            $table->timestamp('atendido_en')->nullable()->after('respuesta');
        });
    }

    public function down(): void
    {
        Schema::table('mensajes_contacto', function (Blueprint $table) {
            $table->dropColumn(['atendido', 'respuesta', 'atendido_en']);
        });
    }
};
