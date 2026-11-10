<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/*
 * Triggers de la capa de datos (capa 3 del enunciado: "tablas relacionales, triggers y contadores").
 *
 * 1. trg_contar_visita: cada fila nueva en "visitas" suma 1 al total de la página en "visitas_pagina".
 * 2. trg_auditar_usuario: registra en la bitácora la creación, eliminación, cambio de rol
 *    y activación/desactivación de usuarios.
 * 3. trg_auditar_permiso: registra en la bitácora cuando se asigna o quita un permiso a un rol.
 *
 * El autor del cambio lo pone Laravel en cada petición con set_config('app.usuario_id', ...)
 * (middleware EstablecerUsuarioBD). Los seeders ponen app.omitir_auditoria = '1' para no llenar la bitácora.
 *
 * Las pruebas automáticas usan SQLite en memoria: ahí se crean triggers equivalentes más simples.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::getDriverName() === 'pgsql' ? $this->postgres() : $this->sqlite();
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::unprepared('
                DROP TRIGGER IF EXISTS trg_contar_visita ON visitas;
                DROP TRIGGER IF EXISTS trg_auditar_usuario ON users;
                DROP TRIGGER IF EXISTS trg_auditar_permiso ON rol_permiso;
                DROP FUNCTION IF EXISTS fn_contar_visita();
                DROP FUNCTION IF EXISTS fn_auditar_usuario();
                DROP FUNCTION IF EXISTS fn_auditar_permiso();
                DROP FUNCTION IF EXISTS fn_autor_actual();
            ');

            return;
        }

        foreach (['trg_contar_visita', 'trg_auditar_usuario_crear', 'trg_auditar_usuario_rol', 'trg_auditar_usuario_activo', 'trg_auditar_usuario_eliminar'] as $t) {
            DB::unprepared("DROP TRIGGER IF EXISTS $t");
        }
    }

    private function postgres(): void
    {
        DB::unprepared(<<<'SQL'
            -- Usuario de la aplicación que hizo el cambio (lo pone Laravel en cada petición)
            CREATE OR REPLACE FUNCTION fn_autor_actual() RETURNS bigint AS $$
                SELECT NULLIF(current_setting('app.usuario_id', true), '')::bigint
            $$ LANGUAGE sql STABLE;

            -- 1. Contador de visitas por página
            CREATE OR REPLACE FUNCTION fn_contar_visita() RETURNS trigger AS $$
            BEGIN
                INSERT INTO visitas_pagina (pagina, total, ultima_visita)
                VALUES (NEW.pagina, 1, NEW.created_at)
                ON CONFLICT (pagina) DO UPDATE
                    SET total = visitas_pagina.total + 1,
                        ultima_visita = EXCLUDED.ultima_visita;
                RETURN NEW;
            END
            $$ LANGUAGE plpgsql;

            CREATE TRIGGER trg_contar_visita
                AFTER INSERT ON visitas
                FOR EACH ROW EXECUTE FUNCTION fn_contar_visita();

            -- 2. Auditoría de usuarios
            CREATE OR REPLACE FUNCTION fn_auditar_usuario() RETURNS trigger AS $$
            DECLARE
                rol_antes text;
                rol_despues text;
            BEGIN
                IF current_setting('app.omitir_auditoria', true) = '1' THEN
                    RETURN NULL;
                END IF;

                IF TG_OP = 'INSERT' THEN
                    INSERT INTO bitacora (user_id, tipo, accion, recurso, detalle)
                    VALUES (fn_autor_actual(), 'auditoria', 'crear_usuario', 'Usuario #' || NEW.id, NEW.email);

                ELSIF TG_OP = 'DELETE' THEN
                    INSERT INTO bitacora (user_id, tipo, accion, recurso, detalle)
                    VALUES (fn_autor_actual(), 'auditoria', 'eliminar_usuario', 'Usuario #' || OLD.id, OLD.email);

                ELSE
                    IF NEW.rol_id IS DISTINCT FROM OLD.rol_id THEN
                        SELECT nombre INTO rol_antes FROM roles WHERE id = OLD.rol_id;
                        SELECT nombre INTO rol_despues FROM roles WHERE id = NEW.rol_id;
                        INSERT INTO bitacora (user_id, tipo, accion, recurso, detalle)
                        VALUES (fn_autor_actual(), 'auditoria', 'cambiar_rol', 'Usuario #' || NEW.id,
                                COALESCE(rol_antes, 'sin rol') || ' -> ' || COALESCE(rol_despues, 'sin rol'));
                    END IF;

                    IF NEW.activo IS DISTINCT FROM OLD.activo THEN
                        INSERT INTO bitacora (user_id, tipo, accion, recurso, detalle)
                        VALUES (fn_autor_actual(), 'auditoria',
                                CASE WHEN NEW.activo THEN 'activar_usuario' ELSE 'desactivar_usuario' END,
                                'Usuario #' || NEW.id, NEW.email);
                    END IF;
                END IF;

                RETURN NULL;
            END
            $$ LANGUAGE plpgsql;

            CREATE TRIGGER trg_auditar_usuario
                AFTER INSERT OR UPDATE OF rol_id, activo OR DELETE ON users
                FOR EACH ROW EXECUTE FUNCTION fn_auditar_usuario();

            -- 3. Auditoría de la matriz de acceso
            CREATE OR REPLACE FUNCTION fn_auditar_permiso() RETURNS trigger AS $$
            DECLARE
                fila rol_permiso;
                nombre_rol text;
                permiso text;
            BEGIN
                IF current_setting('app.omitir_auditoria', true) = '1' THEN
                    RETURN NULL;
                END IF;

                fila := CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
                SELECT nombre INTO nombre_rol FROM roles WHERE id = fila.rol_id;
                SELECT slug INTO permiso FROM permisos WHERE id = fila.permiso_id;

                INSERT INTO bitacora (user_id, tipo, accion, recurso, detalle)
                VALUES (fn_autor_actual(), 'auditoria',
                        CASE WHEN TG_OP = 'DELETE' THEN 'quitar_permiso' ELSE 'asignar_permiso' END,
                        'Rol ' || COALESCE(nombre_rol, '#' || fila.rol_id), permiso);

                RETURN NULL;
            END
            $$ LANGUAGE plpgsql;

            CREATE TRIGGER trg_auditar_permiso
                AFTER INSERT OR DELETE ON rol_permiso
                FOR EACH ROW EXECUTE FUNCTION fn_auditar_permiso();
        SQL);
    }

    private function sqlite(): void
    {
        DB::unprepared(<<<'SQL'
            CREATE TRIGGER trg_contar_visita AFTER INSERT ON visitas
            BEGIN
                INSERT INTO visitas_pagina (pagina, total, ultima_visita) VALUES (NEW.pagina, 1, NEW.created_at)
                ON CONFLICT (pagina) DO UPDATE SET total = total + 1, ultima_visita = excluded.ultima_visita;
            END;

            CREATE TRIGGER trg_auditar_usuario_crear AFTER INSERT ON users
            BEGIN
                INSERT INTO bitacora (tipo, accion, recurso, detalle)
                VALUES ('auditoria', 'crear_usuario', 'Usuario #' || NEW.id, NEW.email);
            END;

            CREATE TRIGGER trg_auditar_usuario_rol AFTER UPDATE OF rol_id ON users
            WHEN OLD.rol_id IS NOT NEW.rol_id
            BEGIN
                INSERT INTO bitacora (tipo, accion, recurso, detalle)
                VALUES ('auditoria', 'cambiar_rol', 'Usuario #' || NEW.id,
                        COALESCE((SELECT nombre FROM roles WHERE id = OLD.rol_id), 'sin rol') || ' -> ' ||
                        COALESCE((SELECT nombre FROM roles WHERE id = NEW.rol_id), 'sin rol'));
            END;

            CREATE TRIGGER trg_auditar_usuario_activo AFTER UPDATE OF activo ON users
            WHEN OLD.activo IS NOT NEW.activo
            BEGIN
                INSERT INTO bitacora (tipo, accion, recurso, detalle)
                VALUES ('auditoria', CASE WHEN NEW.activo THEN 'activar_usuario' ELSE 'desactivar_usuario' END,
                        'Usuario #' || NEW.id, NEW.email);
            END;

            CREATE TRIGGER trg_auditar_usuario_eliminar AFTER DELETE ON users
            BEGIN
                INSERT INTO bitacora (tipo, accion, recurso, detalle)
                VALUES ('auditoria', 'eliminar_usuario', 'Usuario #' || OLD.id, OLD.email);
            END;
        SQL);
    }
};
