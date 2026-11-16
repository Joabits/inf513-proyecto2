<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * CU-29: la bitácora pasa a ser evidencia de auditoría.
 *
 * - usuario: correo del autor en el momento de la acción. user_id se vacía si la cuenta se elimina
 *   (nullOnDelete) y sin este dato se perdería quién hizo cada cosa.
 * - cambios: valores anteriores y nuevos de lo que se editó.
 * - detalle pasa a texto sin límite de 255.
 * - En PostgreSQL la tabla solo admite INSERT: nadie puede corregir ni borrar lo registrado.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bitacora', function (Blueprint $table) {
            $table->string('usuario')->nullable()->after('user_id');
            $table->jsonb('cambios')->nullable()->after('detalle');
            $table->index(['user_id', 'created_at']);
        });

        // En SQLite (pruebas) el largo de un varchar no se aplica, y cambiar la columna obliga a recrear la tabla,
        // lo que rompe los triggers que ya la usan. Solo PostgreSQL limita detalle a 255.
        if (DB::getDriverName() === 'pgsql') {
            Schema::table('bitacora', fn (Blueprint $table) => $table->text('detalle')->nullable()->change());
        }

        // Los registros que ya existen conservan al autor que todavía se puede identificar
        DB::statement('UPDATE bitacora SET usuario = (SELECT email FROM users WHERE users.id = bitacora.user_id) WHERE user_id IS NOT NULL');

        if (DB::getDriverName() === 'pgsql') {
            $this->protegerEnPostgres();
        }
    }

    private function protegerEnPostgres(): void
    {
        DB::unprepared(<<<'SQL'
            -- Toda fila nueva guarda el correo del autor, venga de Laravel, de un trigger o del sistema por correo
            CREATE OR REPLACE FUNCTION fn_bitacora_completar() RETURNS trigger AS $$
            BEGIN
                IF NEW.usuario IS NULL AND NEW.user_id IS NOT NULL THEN
                    SELECT email INTO NEW.usuario FROM users WHERE id = NEW.user_id;
                END IF;
                RETURN NEW;
            END
            $$ LANGUAGE plpgsql;

            CREATE TRIGGER trg_bitacora_completar
                BEFORE INSERT ON bitacora
                FOR EACH ROW EXECUTE FUNCTION fn_bitacora_completar();

            -- Solo se permite el UPDATE que hace la clave foránea al eliminar la cuenta (user_id a NULL);
            -- el correo guardado en "usuario" sigue identificando al autor.
            CREATE OR REPLACE FUNCTION fn_bitacora_inmutable() RETURNS trigger AS $$
            BEGIN
                IF TG_OP = 'UPDATE'
                   AND OLD.user_id IS NOT NULL AND NEW.user_id IS NULL
                   AND NEW.id = OLD.id
                   AND NEW.tipo IS NOT DISTINCT FROM OLD.tipo
                   AND NEW.accion IS NOT DISTINCT FROM OLD.accion
                   AND NEW.recurso IS NOT DISTINCT FROM OLD.recurso
                   AND NEW.detalle IS NOT DISTINCT FROM OLD.detalle
                   AND NEW.cambios IS NOT DISTINCT FROM OLD.cambios
                   AND NEW.usuario IS NOT DISTINCT FROM OLD.usuario
                   AND NEW.ip IS NOT DISTINCT FROM OLD.ip
                   AND NEW.navegador IS NOT DISTINCT FROM OLD.navegador
                   AND NEW.created_at IS NOT DISTINCT FROM OLD.created_at THEN
                    RETURN NEW;
                END IF;

                RAISE EXCEPTION 'La bitácora no se puede modificar ni borrar'
                    USING ERRCODE = 'insufficient_privilege';
            END
            $$ LANGUAGE plpgsql;

            CREATE TRIGGER trg_bitacora_inmutable
                BEFORE UPDATE OR DELETE ON bitacora
                FOR EACH ROW EXECUTE FUNCTION fn_bitacora_inmutable();

            CREATE TRIGGER trg_bitacora_sin_truncate
                BEFORE TRUNCATE ON bitacora
                FOR EACH STATEMENT EXECUTE FUNCTION fn_bitacora_inmutable();
        SQL);
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::unprepared(<<<'SQL'
                DROP TRIGGER IF EXISTS trg_bitacora_sin_truncate ON bitacora;
                DROP TRIGGER IF EXISTS trg_bitacora_inmutable ON bitacora;
                DROP TRIGGER IF EXISTS trg_bitacora_completar ON bitacora;
                DROP FUNCTION IF EXISTS fn_bitacora_inmutable();
                DROP FUNCTION IF EXISTS fn_bitacora_completar();
            SQL);
        }

        Schema::table('bitacora', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'created_at']);
            $table->dropColumn(['usuario', 'cambios']);
        });
    }
};
