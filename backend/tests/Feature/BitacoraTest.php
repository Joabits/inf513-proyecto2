<?php

namespace Tests\Feature;

use App\Compartido\Servicios\Bitacora;
use App\Modulos\Bitacora\BitacoraService;
use App\Models\Rol;
use App\Models\User;
use Database\Seeders\PermisoSeeder;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class BitacoraTest extends TestCase
{
    use RefreshDatabase;

    private const URL = '/api/gestion/bitacora';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RolSeeder::class, PermisoSeeder::class]);
    }

    private function cuenta(string $rol, array $datos = []): User
    {
        return User::factory()->create(['rol_id' => Rol::where('slug', $rol)->value('id'), ...$datos]);
    }

    private function director(): User
    {
        return $this->cuenta(Rol::DIRECTOR, ['email' => 'director@cae.test', 'name' => 'Directora Prueba']);
    }

    private function fila(array $datos): void
    {
        DB::table('bitacora')->insert([
            'tipo' => 'accion',
            'created_at' => now(),
            ...$datos,
        ]);
    }

    /** Las filas que escribe la propia consulta (acceso a la API) no deben confundir los conteos. */
    private function consultar(User $quien, array $filtros = [])
    {
        return $this->actingAs($quien)->getJson(self::URL.'?'.http_build_query($filtros));
    }

    public function test_solo_quien_tiene_permiso_consulta_y_exporta(): void
    {
        $this->getJson(self::URL)->assertUnauthorized();

        $editor = $this->cuenta(Rol::EDITOR_INSTITUCIONAL);
        $this->actingAs($editor)->getJson(self::URL)->assertForbidden();
        $this->actingAs($editor)->getJson(self::URL.'/opciones')->assertForbidden();
        $this->actingAs($editor)->get(self::URL.'/exportar')->assertForbidden();

        $this->consultar($this->director())->assertOk();
    }

    public function test_por_defecto_muestra_la_auditoria_y_separa_sesiones_y_accesos(): void
    {
        $director = $this->director();
        $this->fila(['tipo' => 'accion', 'accion' => 'editar', 'recurso' => 'Proyecto #1']);
        $this->fila(['tipo' => 'auditoria', 'accion' => 'crear_usuario', 'recurso' => 'Usuario #9']);
        $this->fila(['tipo' => 'ingreso_ok']);
        $this->fila(['tipo' => 'acceso', 'accion' => 'GET', 'recurso' => 'api/inicio', 'detalle' => 'HTTP 200']);

        // Crear la cuenta del Director también deja su fila de auditoría (trigger): por eso se compara el conjunto
        $auditoria = $this->consultar($director)->assertOk();
        $this->assertEqualsCanonicalizing(['accion', 'auditoria'], array_values(array_unique(array_column($auditoria->json('data'), 'tipo'))));
        $this->assertContains('Proyecto #1', array_column($auditoria->json('data'), 'recurso'));

        $sesiones = $this->consultar($director, ['grupo' => 'sesiones'])->json('data');
        $this->assertSame(['ingreso_ok'], array_column($sesiones, 'tipo'));

        $accesos = $this->consultar($director, ['grupo' => 'accesos'])->json('data');
        $this->assertContains('api/inicio', array_column($accesos, 'recurso'));
        $this->assertSame(200, collect($accesos)->firstWhere('recurso', 'api/inicio')['codigo_http']);
    }

    public function test_pagina_en_el_servidor_del_mas_reciente_al_mas_antiguo(): void
    {
        $director = $this->director();
        for ($i = 1; $i <= 30; $i++) {
            $this->fila(['accion' => 'editar', 'recurso' => "Proyecto #$i", 'created_at' => now()->subMinutes(31 - $i)]);
        }

        $primera = $this->consultar($director, ['accion' => 'editar'])->assertOk();
        $this->assertCount(25, $primera->json('data'));
        $this->assertSame(30, $primera->json('meta.total'));
        $this->assertSame(2, $primera->json('meta.last_page'));
        $this->assertSame('Proyecto #30', $primera->json('data.0.recurso'));

        $segunda = $this->consultar($director, ['accion' => 'editar', 'page' => 2]);
        $this->assertCount(5, $segunda->json('data'));
        $this->assertSame('Proyecto #1', $segunda->json('data.4.recurso'));
    }

    public function test_filtra_por_usuario_accion_texto_y_fechas(): void
    {
        $director = $this->director();
        $this->fila(['usuario' => 'ana@cae.test', 'accion' => 'publicar', 'recurso' => 'Documento #3', 'detalle' => 'Reglamento de Titulación', 'created_at' => '2026-11-10 09:00:00']);
        $this->fila(['usuario' => 'luis@cae.test', 'accion' => 'eliminar', 'recurso' => 'Proyecto #8', 'detalle' => 'Estudio de mercado', 'created_at' => '2026-11-14 18:30:00']);

        $recursos = fn (array $filtros) => array_column($this->consultar($director, $filtros)->json('data'), 'recurso');

        $this->assertSame(['Documento #3'], $recursos(['usuario' => 'ana@cae.test']));
        $this->assertSame(['Proyecto #8'], $recursos(['accion' => 'eliminar']));
        $this->assertSame(['Documento #3'], $recursos(['texto' => 'TITULACION']), 'sin distinguir tildes ni mayúsculas');
        $this->assertSame(['Proyecto #8'], $recursos(['desde' => '2026-11-14', 'hasta' => '2026-11-14']), 'el día final se incluye completo');
        $this->assertSame([], $recursos(['desde' => '2026-11-11', 'hasta' => '2026-11-13']));
    }

    public function test_filtra_los_accesos_denegados(): void
    {
        $director = $this->director();
        $this->fila(['tipo' => 'acceso', 'accion' => 'DELETE', 'recurso' => 'api/gestion/usuarios/{usuario}', 'detalle' => 'HTTP 403']);
        $this->fila(['tipo' => 'acceso', 'accion' => 'GET', 'recurso' => 'api/revista', 'detalle' => 'HTTP 200']);
        $this->fila(['tipo' => 'acceso', 'accion' => 'POST', 'recurso' => 'api/contacto', 'detalle' => 'HTTP 422']);

        $recursos = fn (string $resultado) => array_column($this->consultar($director, ['grupo' => 'accesos', 'resultado' => $resultado])->json('data'), 'recurso');

        $this->assertSame(['api/gestion/usuarios/{usuario}'], $recursos('denegado'));
        $this->assertSame(['api/contacto'], $recursos('error'));
        $this->assertContains('api/revista', $recursos('exito'));
        $this->assertNotContains('api/gestion/usuarios/{usuario}', $recursos('exito'));
    }

    public function test_valida_los_filtros(): void
    {
        $director = $this->director();
        $this->consultar($director, ['desde' => '2026-11-20', 'hasta' => '2026-11-01'])->assertUnprocessable()->assertJsonValidationErrors('hasta');
        $this->consultar($director, ['grupo' => 'inventado'])->assertUnprocessable();
        $this->consultar($director, ['desde' => '20-11-2026'])->assertUnprocessable();
    }

    public function test_registra_que_cambio_al_editar_sin_copiar_contrasenas(): void
    {
        $director = $this->director();
        // Como en la aplicación: el modelo viene de la base, no recién creado
        $persona = User::find($this->cuenta(Rol::USUARIO, ['name' => 'Nombre Anterior'])->id);

        $persona->update(['name' => 'Nombre Nuevo', 'password' => 'OtraClave2026']);
        app(Bitacora::class)->accion($director, 'editar', $persona, $persona->email);

        $registro = $this->consultar($director, ['accion' => 'editar'])->json('data.0');
        $this->assertSame(['antes' => 'Nombre Anterior', 'despues' => 'Nombre Nuevo'], $registro['cambios']['name']);
        $this->assertArrayNotHasKey('password', $registro['cambios']);
        $this->assertArrayNotHasKey('updated_at', $registro['cambios']);
    }

    public function test_un_modelo_recien_creado_o_sin_cambios_no_registra_diferencias(): void
    {
        $nuevo = $this->cuenta(Rol::USUARIO);
        $this->assertNull(Bitacora::diferencias($nuevo));

        $existente = User::find($nuevo->id);
        $existente->update(['name' => $existente->name]);
        $this->assertNull(Bitacora::diferencias($existente));
    }

    public function test_los_textos_largos_se_recortan(): void
    {
        // Sin guardar: PostgreSQL rechaza un nombre de 500 caracteres (varchar 255) antes de llegar a la bitácora.
        // Lo que se prueba es el recorte que hace la bitácora con un cambio largo, sea del campo que sea.
        $persona = User::find($this->cuenta(Rol::USUARIO)->id);
        $persona->name = str_repeat('a', 500);
        $persona->syncChanges();

        $this->assertLessThanOrEqual(303, mb_strlen(Bitacora::diferencias($persona)['name']['despues']));
    }

    public function test_el_autor_se_conserva_aunque_su_cuenta_se_elimine(): void
    {
        $director = $this->director();
        $editora = $this->cuenta(Rol::EDITOR_INSTITUCIONAL, ['email' => 'editora@cae.test', 'name' => 'Editora']);
        app(Bitacora::class)->accion($editora, 'eliminar', 'Proyecto #5', 'Proyecto de prueba');

        $editora->delete();

        $registro = $this->consultar($director, ['accion' => 'eliminar'])->json('data.0');
        $this->assertSame('editora@cae.test', $registro['usuario']);
        $this->assertTrue($registro['cuenta_eliminada']);
        $this->assertNull($registro['nombre']);
    }

    public function test_las_opciones_listan_usuarios_y_acciones_registradas(): void
    {
        $director = $this->director();
        $this->fila(['usuario' => 'ana@cae.test', 'accion' => 'publicar']);
        $this->fila(['tipo' => 'acceso', 'usuario' => 'ana@cae.test', 'accion' => 'GET']);

        $opciones = $this->actingAs($director)->getJson(self::URL.'/opciones')->assertOk();
        $this->assertContains('ana@cae.test', $opciones->json('usuarios'));
        $this->assertContains('publicar', $opciones->json('acciones'));
        $this->assertNotContains('GET', $opciones->json('acciones'), 'los métodos HTTP de los accesos no son acciones');
        $this->assertSame(['auditoria', 'sesiones', 'denegados'], array_column($opciones->json('grupos'), 'valor'), 'el registro técnico no se ofrece en el panel');
    }

    /**
     * Los triggers de PostgreSQL anotan cada INSERT y DELETE de rol_permiso. Si el seeder vaciara la tabla y la
     * volviera a llenar, cada ejecución dejaría cientos de «quitó» y «asignó» falsos. Aquí se comprueba qué escribe.
     * (Los triggers de permisos solo existen en PostgreSQL, por eso se mira el SQL y no la bitácora.)
     */
    private function escriturasEnMatriz(callable $accion): array
    {
        $escrituras = [];
        DB::listen(function ($consulta) use (&$escrituras) {
            if (preg_match('/^(insert into|delete from|update)\s+"?rol_permiso"?/i', $consulta->sql, $m)) {
                $escrituras[] = strtolower($m[1]);
            }
        });
        $accion();

        return $escrituras;
    }

    public function test_volver_a_sembrar_los_permisos_sin_cambios_no_escribe_en_la_matriz(): void
    {
        $this->assertSame([], $this->escriturasEnMatriz(fn () => $this->seed(PermisoSeeder::class)));
    }

    public function test_al_sembrar_solo_se_escribe_lo_que_cambio(): void
    {
        $editor = Rol::where('slug', Rol::EDITOR_COMUNICACION)->firstOrFail();
        $editor->permisos()->detach($editor->permisos()->where('slug', 'noticias.eliminar')->value('permisos.id'));

        $escrituras = $this->escriturasEnMatriz(fn () => $this->seed(PermisoSeeder::class));

        $this->assertSame(['insert into'], $escrituras, 'solo vuelve a asignar el permiso que faltaba');
        $this->assertTrue($editor->permisos()->where('slug', 'noticias.eliminar')->exists());
    }

    public function test_los_intentos_sin_permiso_muestran_la_seccion_y_ocultan_lo_exitoso(): void
    {
        $director = $this->director();
        $this->fila(['tipo' => 'acceso', 'usuario' => 'luis@cae.test', 'accion' => 'DELETE', 'recurso' => 'api/gestion/usuarios/{usuario}', 'detalle' => 'HTTP 403']);
        $this->fila(['tipo' => 'acceso', 'accion' => 'GET', 'recurso' => 'api/gestion/revista', 'detalle' => 'HTTP 401']);
        $this->fila(['tipo' => 'acceso', 'accion' => 'GET', 'recurso' => 'api/revista', 'detalle' => 'HTTP 200']);
        $this->fila(['tipo' => 'acceso', 'accion' => 'POST', 'recurso' => 'api/contacto', 'detalle' => 'HTTP 422']);

        $filas = $this->consultar($director, ['grupo' => 'denegados'])->assertOk()->json('data');

        $this->assertCount(2, $filas, 'solo los 401 y 403, sin los correctos ni los errores de validación');
        $porRuta = collect($filas)->keyBy('recurso');
        $this->assertSame('Usuarios', $porRuta['api/gestion/usuarios/{usuario}']['seccion']);
        $this->assertSame('luis@cae.test', $porRuta['api/gestion/usuarios/{usuario}']['usuario']);
        $this->assertSame('Revista INNOVAR', $porRuta['api/gestion/revista']['seccion']);
        $this->assertNull($porRuta['api/gestion/revista']['usuario'], 'sin sesión');
    }

    public function test_las_rutas_se_traducen_a_secciones_del_panel(): void
    {
        $this->assertSame('Solicitudes a INNOVA', BitacoraService::seccionDe('api/gestion/innova/solicitudes/3'));
        $this->assertSame('Empresa Junior INNOVA', BitacoraService::seccionDe('api/innova'));
        $this->assertSame('Página de inicio', BitacoraService::seccionDe('api/inicio/banners'));
        $this->assertSame('Datos de contacto y enlaces', BitacoraService::seccionDe('api/configuracion/enlaces'));
        $this->assertNull(BitacoraService::seccionDe('api/ruta-desconocida'));
        $this->assertNull(BitacoraService::seccionDe('api/innovacion-falsa'), 'un prefijo solo cuenta si es un segmento completo');
    }

    public function test_el_filtro_de_importancia_deja_solo_lo_que_borra_o_cambia_permisos(): void
    {
        $director = $this->director();
        $this->fila(['accion' => 'eliminar', 'recurso' => 'Proyecto #1']);
        $this->fila(['accion' => 'editar', 'recurso' => 'Proyecto #2']);
        $this->fila(['accion' => 'exportar', 'recurso' => 'Bitácora']);
        $this->fila(['accion' => 'cambiar_clave', 'recurso' => 'User #4']);
        $this->fila(['tipo' => 'auditoria', 'accion' => 'cambiar_rol', 'recurso' => 'Usuario #4']);
        $this->fila(['tipo' => 'auditoria', 'accion' => 'quitar_permiso', 'recurso' => 'Rol de prueba']);

        // Solo las filas de esta prueba: en PostgreSQL los triggers ya registraron la siembra inicial de permisos
        $propias = ['Proyecto #1', 'Proyecto #2', 'Bitácora', 'User #4', 'Usuario #4', 'Rol de prueba'];
        $acciones = fn (array $filtros) => collect($this->consultar($director, $filtros)->json('data'))
            ->whereIn('recurso', $propias)->pluck('accion')->sort()->values()->all();

        $this->assertSame(['cambiar_rol', 'eliminar', 'quitar_permiso'], $acciones(['importancia' => 'importantes']),
            'exportar y cambiar contraseñas se ven, pero no se marcan como importantes');
        $this->assertContains('editar', $acciones([]), 'sin el filtro se ve todo');
        $this->assertContains('exportar', $acciones([]));
    }

    public function test_en_ingresos_y_salidas_lo_importante_son_los_intentos_fallidos(): void
    {
        $director = $this->director();
        $this->fila(['tipo' => 'ingreso_ok']);
        $this->fila(['tipo' => 'ingreso_fallido', 'detalle' => 'Correo: x@y.com']);
        $this->fila(['tipo' => 'salida']);

        $tipos = collect($this->consultar($director, ['grupo' => 'sesiones', 'importancia' => 'importantes'])->json('data'))->pluck('tipo')->all();

        $this->assertSame(['ingreso_fallido'], $tipos);
    }

    public function test_rechaza_una_importancia_desconocida(): void
    {
        $this->consultar($this->director(), ['importancia' => 'urgentes'])->assertUnprocessable()->assertJsonValidationErrors('importancia');
    }

    public function test_exporta_csv_con_los_filtros_y_la_exportacion_queda_registrada(): void
    {
        $director = $this->director();
        $this->fila(['usuario' => 'ana@cae.test', 'accion' => 'publicar', 'recurso' => 'Documento #3', 'detalle' => 'Reglamento de Titulación']);
        $this->fila(['usuario' => 'luis@cae.test', 'accion' => 'eliminar', 'recurso' => 'Proyecto #8', 'detalle' => '=HYPERLINK("http://malo")']);

        $respuesta = $this->actingAs($director)->get(self::URL.'/exportar?accion=publicar');
        $respuesta->assertOk();
        $this->assertStringContainsString('text/csv', $respuesta->headers->get('Content-Type'));

        $csv = $respuesta->streamedContent();
        $this->assertStringStartsWith("\xEF\xBB\xBF", $csv);
        $this->assertStringStartsWith('N.º,Fecha,Hora,Tipo', ltrim($csv, "\xEF\xBB\xBF"), 'el número de registro va primero y la fecha y la hora, separadas');
        $this->assertMatchesRegularExpression('/^\d+,\d{4}-\d{2}-\d{2},\d{2}:\d{2}:\d{2},/m', $csv, 'cada fila trae la fecha y la hora en columnas distintas');
        $idPublicar = DB::table('bitacora')->where('accion', 'publicar')->value('id');
        $this->assertMatchesRegularExpression('/^'.$idPublicar.',/m', $csv, 'cada fila lleva su id para cruzarla con la tabla');
        $this->assertStringContainsString('Reglamento de Titulación', $csv);
        $this->assertStringNotContainsString('Proyecto #8', $csv, 'respeta el filtro');

        $exportacion = DB::table('bitacora')->where('accion', 'exportar')->first();
        $this->assertSame($director->id, $exportacion->user_id);
        $this->assertStringContainsString('acción: publicar', $exportacion->detalle);
    }

    public function test_el_csv_neutraliza_formulas(): void
    {
        $director = $this->director();
        $this->fila(['accion' => 'eliminar', 'recurso' => 'Proyecto #8', 'detalle' => '=HYPERLINK("http://malo")']);

        $csv = $this->actingAs($director)->get(self::URL.'/exportar?accion=eliminar')->streamedContent();
        $this->assertStringContainsString("'=HYPERLINK", $csv);
    }
}
