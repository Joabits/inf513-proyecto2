<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Ninguna tabla queda suelta en el modelo de datos.
 *
 * 1. Las listas de cada sección cuelgan de la fila de contenido de esa sección (1 a N; se borran con ella):
 *    institucional -> institucional_hitos; inicio_portada -> inicio_banners, inicio_accesos, inicio_cifras;
 *    configuracion_contacto -> configuracion_redes, configuracion_enlaces; innova -> innova_servicios;
 *    investigacion_contenido -> investigacion_semilleros; malla_plan -> malla_materias; revista -> revista_ediciones.
 * 2. mensajes_contacto guarda quién atendió el mensaje (atendido_por -> users), igual que innova_solicitudes.
 *    Se quita la columna "atendido": repetía lo mismo que "estado".
 * 3. personal_carrera guarda quién cargó o editó la ficha (user_id -> users), como el resto del contenido.
 * 4. Cada visita apunta al contador de su página (visitas.pagina -> visitas_pagina.pagina). El trigger que suma
 *    la visita pasa a ejecutarse ANTES de guardarla, así el contador ya existe cuando se valida la clave.
 * 5. sessions.user_id apunta a users: al eliminar una cuenta se cierran sus sesiones.
 * 6. Se elimina password_reset_tokens: el portal no tiene recuperación de contraseña por correo.
 */
return new class extends Migration
{
    /** tabla de la lista => [columna nueva, tabla del contenido de la sección] */
    private const LISTAS = [
        'institucional_hitos' => ['institucional_id', 'institucional'],
        'inicio_banners' => ['portada_id', 'inicio_portada'],
        'inicio_accesos' => ['portada_id', 'inicio_portada'],
        'inicio_cifras' => ['portada_id', 'inicio_portada'],
        'configuracion_redes' => ['configuracion_id', 'configuracion_contacto'],
        'configuracion_enlaces' => ['configuracion_id', 'configuracion_contacto'],
        'innova_servicios' => ['innova_id', 'innova'],
        'investigacion_semilleros' => ['contenido_id', 'investigacion_contenido'],
        'malla_materias' => ['plan_id', 'malla_plan'],
        'revista_ediciones' => ['revista_id', 'revista'],
    ];

    public function up(): void
    {
        // 1. Listas -> contenido de su sección
        foreach (self::LISTAS as $tabla => [$columna, $contenido]) {
            Schema::table($tabla, function (Blueprint $table) use ($columna) {
                $table->unsignedBigInteger($columna)->nullable();
            });

            $id = DB::table($contenido)->orderBy('id')->value('id');
            if ($id !== null) {
                DB::table($tabla)->update([$columna => $id]);
            } elseif (DB::table($tabla)->exists()) {
                throw new RuntimeException("La tabla {$tabla} tiene filas, pero {$contenido} está vacía: no hay a qué enlazarlas.");
            }

            Schema::table($tabla, function (Blueprint $table) use ($columna, $contenido) {
                $table->unsignedBigInteger($columna)->nullable(false)->change();
                $table->foreign($columna)->references('id')->on($contenido)->cascadeOnDelete();
                $table->index($columna);
            });
        }

        // 2. Mensajes de contacto: quién los atendió; "atendido" repetía "estado"
        DB::table('mensajes_contacto')->where('atendido', true)->update(['estado' => 'atendido']);
        Schema::table('mensajes_contacto', function (Blueprint $table) {
            $table->dropColumn('atendido');
        });
        Schema::table('mensajes_contacto', function (Blueprint $table) {
            $table->foreignId('atendido_por')->nullable()->constrained('users')->nullOnDelete();
        });

        // 3. Personal de la Carrera: quién cargó la ficha
        Schema::table('personal_carrera', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
        });

        // 4. Visitas -> contador de su página (por si alguna página no tuviera su contador todavía)
        DB::table('visitas_pagina')->insertUsing(
            ['pagina', 'total', 'ultima_visita'],
            DB::table('visitas')
                ->select('pagina', DB::raw('count(*)'), DB::raw('max(created_at)'))
                ->whereNotIn('pagina', DB::table('visitas_pagina')->select('pagina'))
                ->groupBy('pagina'),
        );
        Schema::table('visitas', function (Blueprint $table) {
            $table->foreign('pagina')->references('pagina')->on('visitas_pagina')->cascadeOnDelete();
        });
        $this->triggerContarVisita('BEFORE');

        // 5. Sesiones -> usuario (se quitan las de cuentas que ya no existen)
        DB::table('sessions')->whereNotNull('user_id')->whereNotIn('user_id', DB::table('users')->select('id'))->delete();
        Schema::table('sessions', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        // 6. Tabla sin uso
        Schema::dropIfExists('password_reset_tokens');
    }

    public function down(): void
    {
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::table('sessions', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });

        Schema::table('visitas', function (Blueprint $table) {
            $table->dropForeign(['pagina']);
        });
        $this->triggerContarVisita('AFTER');

        Schema::table('personal_carrera', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
        });

        Schema::table('mensajes_contacto', function (Blueprint $table) {
            $table->dropConstrainedForeignId('atendido_por');
        });
        Schema::table('mensajes_contacto', function (Blueprint $table) {
            $table->boolean('atendido')->default(false);
        });
        DB::table('mensajes_contacto')->where('estado', 'atendido')->update(['atendido' => true]);

        foreach (self::LISTAS as $tabla => [$columna]) {
            Schema::table($tabla, function (Blueprint $table) use ($columna) {
                $table->dropForeign([$columna]);
                $table->dropIndex([$columna]);
            });
            Schema::table($tabla, function (Blueprint $table) use ($columna) {
                $table->dropColumn($columna);
            });
        }
    }

    /**
     * Vuelve a crear trg_contar_visita en el momento indicado (BEFORE o AFTER).
     * En SQLite (pruebas) también hace falta porque cambiar la tabla visitas la vuelve a crear sin sus triggers.
     */
    private function triggerContarVisita(string $momento): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::unprepared("
                DROP TRIGGER IF EXISTS trg_contar_visita ON visitas;
                CREATE TRIGGER trg_contar_visita
                    {$momento} INSERT ON visitas
                    FOR EACH ROW EXECUTE FUNCTION fn_contar_visita();
            ");

            return;
        }

        DB::unprepared('DROP TRIGGER IF EXISTS trg_contar_visita');
        DB::unprepared("
            CREATE TRIGGER trg_contar_visita {$momento} INSERT ON visitas
            BEGIN
                INSERT INTO visitas_pagina (pagina, total, ultima_visita) VALUES (NEW.pagina, 1, NEW.created_at)
                ON CONFLICT (pagina) DO UPDATE SET total = total + 1, ultima_visita = excluded.ultima_visita;
            END;
        ");
    }
};
