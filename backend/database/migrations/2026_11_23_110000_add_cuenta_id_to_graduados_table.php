<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * CU-10: el graduado con cuenta (rol Usuario) registra y actualiza sus propios datos en «Mis datos de graduado».
 * cuenta_id es la cuenta del graduado (una por graduado); user_id sigue siendo quien cargó el registro.
 * Los registros que carga el personal no tienen cuenta (null).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('graduados', function (Blueprint $table) {
            $table->foreignId('cuenta_id')->nullable()->unique()->after('user_id')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('graduados', function (Blueprint $table) {
            $table->dropConstrainedForeignId('cuenta_id');
        });
    }
};
