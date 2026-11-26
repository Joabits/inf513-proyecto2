<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * El modelo de datos queda en un solo bloque: ningún grupo de tablas queda aparte del resto.
 *
 * Las listas ya cuelgan del contenido de su sección (2026_11_24_100000), pero seis de esos contenidos no se
 * relacionaban con nada más. Ahora:
 * 1. El contenido de cada sección guarda quién lo actualizó por última vez (user_id -> users), como ya lo hacía
 *    informacion_academica: inicio_portada, configuracion_contacto, institucional, investigacion_contenido e innova.
 *    Las filas que ya existen quedan sin autor hasta su próxima edición.
 * 2. El plan de estudios es parte de la información académica, que lo muestra en su página
 *    (malla_plan.informacion_academica_id -> informacion_academica).
 */
return new class extends Migration
{
    private const CONTENIDOS = ['inicio_portada', 'configuracion_contacto', 'institucional', 'investigacion_contenido', 'innova'];

    public function up(): void
    {
        foreach (self::CONTENIDOS as $tabla) {
            Schema::table($tabla, function (Blueprint $table) {
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            });
        }

        Schema::table('malla_plan', function (Blueprint $table) {
            $table->foreignId('informacion_academica_id')->nullable()->constrained('informacion_academica')->nullOnDelete();
        });

        $informacion = DB::table('informacion_academica')->orderBy('id')->value('id');
        if ($informacion !== null) {
            DB::table('malla_plan')->update(['informacion_academica_id' => $informacion]);
        }
    }

    public function down(): void
    {
        Schema::table('malla_plan', function (Blueprint $table) {
            $table->dropConstrainedForeignId('informacion_academica_id');
        });

        foreach (self::CONTENIDOS as $tabla) {
            Schema::table($tabla, function (Blueprint $table) {
                $table->dropConstrainedForeignId('user_id');
            });
        }
    }
};
