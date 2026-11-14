<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use App\Modulos\Documentos\Categoria;
use App\Modulos\Documentos\Documento;
use App\Modulos\Investigacion\Proyecto;
use Database\Seeders\DocumentoCategoriaSeeder;
use Database\Seeders\InstitucionalSeeder;
use Database\Seeders\InvestigacionSeeder;
use Database\Seeders\MallaCurricularSeeder;
use Database\Seeders\PermisoSeeder;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class BusquedaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([
            RolSeeder::class, PermisoSeeder::class, DocumentoCategoriaSeeder::class,
            InstitucionalSeeder::class, InvestigacionSeeder::class, MallaCurricularSeeder::class,
        ]);
    }

    private function documento(string $titulo, bool $publicado = true, ?string $descripcion = null): Documento
    {
        return Documento::create([
            'titulo' => $titulo,
            'descripcion' => $descripcion,
            'categoria_id' => Categoria::where('nombre', 'Reglamentos')->value('id'),
            'archivo' => 'documentos/x.pdf',
            'nombre_original' => 'x.pdf',
            'tipo' => 'pdf',
            'mime' => 'application/pdf',
            'tamano' => 1000,
            'publicado' => $publicado,
        ]);
    }

    private function proyecto(string $titulo, bool $publicado = true): Proyecto
    {
        return Proyecto::create([
            'titulo' => $titulo, 'tipo' => 'investigacion', 'responsable' => 'Lic. Responsable', 'gestion' => 2026,
            'estado' => 'en_curso', 'resumen' => 'Resumen del proyecto de prueba con suficiente texto.', 'publicado' => $publicado,
        ]);
    }

    private function buscar(string $q, ?string $tipo = null)
    {
        return $this->getJson('/api/buscar?'.http_build_query(array_filter(['q' => $q, 'tipo' => $tipo])));
    }

    private function grupo($respuesta, string $tipo): ?array
    {
        return collect($respuesta->json('grupos'))->firstWhere('tipo', $tipo);
    }

    public function test_valida_el_largo_de_la_busqueda(): void
    {
        $this->buscar('ab')->assertUnprocessable()->assertJsonValidationErrors(['q' => '3 caracteres']);
        $this->buscar(str_repeat('a', 81))->assertUnprocessable()->assertJsonValidationErrors('q');
        $this->buscar('contabilidad', 'inexistente')->assertUnprocessable()->assertJsonValidationErrors('tipo');
    }

    public function test_no_distingue_mayusculas_ni_tildes(): void
    {
        $this->documento('Reglamento de Titulación');

        foreach (['titulacion', 'TITULACIÓN', 'TiTuLaCiOn'] as $q) {
            $this->assertSame('Reglamento de Titulación', $this->grupo($this->buscar($q), 'documento')['resultados'][0]['titulo'] ?? null, $q);
        }
    }

    public function test_varias_palabras_exigen_todas(): void
    {
        $this->documento('Reglamento de titulación');
        $this->documento('Reglamento de becas');

        $grupo = $this->grupo($this->buscar('reglamento titulacion'), 'documento');

        $this->assertSame(1, $grupo['total']);
    }

    public function test_lo_oculto_no_aparece(): void
    {
        $this->documento('Borrador zafiro', publicado: false);
        $this->proyecto('Proyecto zafiro oculto', publicado: false);

        $this->buscar('zafiro')->assertOk()->assertJsonPath('total', 0);
    }

    public function test_los_datos_personales_nunca_se_buscan(): void
    {
        $marca = 'xilofonoazul';
        DB::table('innova_solicitudes')->insert([
            'nombre' => "Persona {$marca}", 'correo' => "{$marca}@correo.test", 'descripcion' => "Necesito {$marca}",
            'estado' => 'pendiente', 'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('mensajes_contacto')->insert([
            'nombre' => "Persona {$marca}", 'correo' => "{$marca}@correo.test", 'asunto' => $marca, 'mensaje' => $marca,
            'created_at' => now(), 'updated_at' => now(),
        ]);
        User::factory()->create(['name' => "Usuario {$marca}", 'email' => "{$marca}@cae.test", 'rol_id' => Rol::where('slug', Rol::DIRECTOR)->value('id')]);

        $this->buscar($marca)->assertOk()->assertJsonPath('total', 0);
    }

    public function test_los_comodines_se_buscan_como_texto(): void
    {
        $this->documento('Informe al 100% de avance');
        $this->documento('Informe 1000 de prueba');

        $this->assertSame(1, $this->grupo($this->buscar('100%'), 'documento')['total']);
        $this->assertNull($this->grupo($this->buscar('in_orme'), 'documento'));
    }

    public function test_agrupa_por_tipo_con_tope_y_permite_ver_todo_un_tipo(): void
    {
        $todos = $this->buscar('administracion');
        $materias = $this->grupo($todos, 'materia');

        $this->assertGreaterThan(5, $materias['total']);
        $this->assertCount(5, $materias['resultados']);

        $solo = $this->buscar('administracion', 'materia');
        $this->assertCount($materias['total'], $this->grupo($solo, 'materia')['resultados']);
        // Los demás grupos conservan su cantidad para las pestañas, sin resultados
        $this->assertSame([], $this->grupo($solo, 'carrera')['resultados']);
        $this->assertSame($todos->json('total'), $solo->json('total'));
    }

    public function test_el_titulo_pesa_mas_que_la_descripcion(): void
    {
        $this->documento('Guía general', descripcion: 'Incluye el calendario académico');
        $this->documento('Calendario académico 2026');

        $titulos = array_column($this->grupo($this->buscar('calendario'), 'documento')['resultados'], 'titulo');

        $this->assertSame('Calendario académico 2026', $titulos[0]);
    }

    public function test_cada_resultado_lleva_a_su_pagina(): void
    {
        $documento = $this->documento('Reglamento de titulación');
        $this->proyecto('Clima organizacional en empresas familiares');

        $doc = $this->grupo($this->buscar('titulacion'), 'documento')['resultados'][0];
        $this->assertSame("/api/documentos/{$documento->id}/descargar", $doc['ruta']);
        $this->assertTrue($doc['externo']);

        $proyecto = $this->grupo($this->buscar('clima organizacional'), 'proyecto')['resultados'][0];
        $this->assertStringStartsWith('/investigacion?q=', $proyecto['ruta']);
        $this->assertFalse($proyecto['externo']);
    }

    public function test_la_carrera_se_encuentra_por_el_nombre_de_la_seccion(): void
    {
        $resultado = $this->grupo($this->buscar('mision'), 'carrera')['resultados'][0];

        $this->assertSame('Misión', $resultado['titulo']);
        $this->assertSame('/carrera', $resultado['ruta']);
    }

    public function test_el_fragmento_no_parte_palabras(): void
    {
        $largo = str_repeat('Texto de relleno para alargar la descripción. ', 8).'Aquí se menciona la acreditación del programa. '.str_repeat('Más relleno al final. ', 8);
        // Un resumen de proyecto admite textos largos (la descripción de un documento llega a 300 caracteres)
        Proyecto::create([
            'titulo' => 'Informe anual de la Carrera', 'tipo' => 'investigacion', 'responsable' => 'Lic. Responsable', 'gestion' => 2026,
            'estado' => 'en_curso', 'resumen' => $largo, 'publicado' => true,
        ]);

        $resumen = $this->grupo($this->buscar('acreditacion programa'), 'proyecto')['resultados'][0]['resumen'];

        $this->assertStringStartsWith('…', $resumen);
        $this->assertStringContainsString('acreditación', $resumen);
        $this->assertMatchesRegularExpression('/^… ?[A-ZÁÉÍÓÚa-záéíóúñ]/u', $resumen);
        $this->assertStringEndsWith('…', $resumen);
    }
}
