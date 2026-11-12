<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use App\Modulos\Investigacion\Linea;
use App\Modulos\Investigacion\Proyecto;
use Database\Seeders\InvestigacionSeeder;
use Database\Seeders\PermisoSeeder;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvestigacionTest extends TestCase
{
    use RefreshDatabase;

    private const GESTION = '/api/gestion/investigacion';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RolSeeder::class, PermisoSeeder::class, InvestigacionSeeder::class]);
    }

    private function cuenta(string $rol = Rol::EDITOR_INSTITUCIONAL): User
    {
        return User::factory()->create(['rol_id' => Rol::where('slug', $rol)->value('id')]);
    }

    private function proyecto(array $cambios = []): array
    {
        return [
            'titulo' => '  Impacto del  marketing digital en las mypes de Santa Cruz ',
            'tipo' => 'investigacion',
            'linea_id' => Linea::where('nombre', 'like', 'Marketing%')->value('id'),
            'responsable' => 'Dr. Deivit Castro Aguilera',
            'integrantes' => '',
            'gestion' => 2026,
            'estado' => 'en_curso',
            'resumen' => 'Analiza cómo las micro y pequeñas empresas cruceñas usan las redes sociales para vender.',
            'publicado' => true,
            ...$cambios,
        ];
    }

    private function crear(array $cambios = [], ?User $editor = null): Proyecto
    {
        $id = $this->actingAs($editor ?? $this->cuenta())->postJson(self::GESTION.'/proyectos', $this->proyecto($cambios))
            ->assertCreated()
            ->json('data.id');

        return Proyecto::findOrFail($id);
    }

    public function test_la_consulta_publica_trae_las_lineas_semilleros_y_solo_proyectos_publicados(): void
    {
        $this->crear();
        $this->crear(['titulo' => 'Proyecto en preparación todavía oculto', 'publicado' => false]);

        $respuesta = $this->getJson('/api/investigacion')->assertOk();

        $respuesta->assertJsonCount(11, 'lineas')
            ->assertJsonCount(1, 'proyectos')
            ->assertJsonCount(6, 'semilleros')
            ->assertJsonPath('proyectos.0.titulo', 'Impacto del marketing digital en las mypes de Santa Cruz')
            ->assertJsonPath('contenido.semilleros_coordinador', 'Lic. Saúl E. Lozano Morales')
            ->assertJsonMissingPath('proyectos.0.editado_por');

        $marketing = collect($respuesta->json('lineas'))->firstWhere('nombre', 'Marketing, Inteligencia de Negocios y Comportamiento del Consumidor');
        $this->assertSame(1, $marketing['proyectos']);
    }

    public function test_gestionar_exige_sesion_y_permiso(): void
    {
        $this->getJson(self::GESTION)->assertUnauthorized();
        $this->actingAs($this->cuenta(Rol::EDITOR_COMUNICACION))->getJson(self::GESTION)->assertForbidden();
        $this->actingAs($this->cuenta(Rol::EDITOR_COMUNICACION))->postJson(self::GESTION.'/proyectos', $this->proyecto())->assertForbidden();
    }

    public function test_el_editor_registra_edita_oculta_y_elimina_un_proyecto(): void
    {
        $editor = $this->cuenta();
        $proyecto = $this->crear([], $editor);

        $this->assertSame('Impacto del marketing digital en las mypes de Santa Cruz', $proyecto->titulo);
        $this->assertNull($proyecto->integrantes);
        $this->assertDatabaseHas('bitacora', ['user_id' => $editor->id, 'accion' => 'crear', 'recurso' => "Proyecto #{$proyecto->id}"]);

        $this->actingAs($editor)
            ->putJson(self::GESTION."/proyectos/{$proyecto->id}", $this->proyecto(['estado' => 'concluido', 'tipo' => 'aula', 'linea_id' => '']))
            ->assertOk()
            ->assertJsonPath('data.estado', 'concluido')
            ->assertJsonPath('data.tipo', 'aula')
            ->assertJsonPath('data.linea', null)
            ->assertJsonPath('data.editado_por', $editor->name);

        $this->actingAs($editor)
            ->patchJson(self::GESTION."/proyectos/{$proyecto->id}/publicacion", ['publicado' => false])
            ->assertOk()
            ->assertJsonPath('data.publicado', false);
        $this->getJson('/api/investigacion')->assertJsonCount(0, 'proyectos');
        $this->assertDatabaseHas('bitacora', ['accion' => 'ocultar', 'recurso' => "Proyecto #{$proyecto->id}"]);

        $this->actingAs($editor)->deleteJson(self::GESTION."/proyectos/{$proyecto->id}")->assertNoContent();
        $this->assertModelMissing($proyecto);
    }

    public function test_valida_el_proyecto_con_mensajes_en_espanol(): void
    {
        $this->actingAs($this->cuenta())
            ->postJson(self::GESTION.'/proyectos', $this->proyecto([
                'titulo' => 'Corto',
                'tipo' => 'tesis',
                'linea_id' => 999,
                'gestion' => 1950,
                'estado' => 'pausado',
                'resumen' => 'Muy breve.',
            ]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['titulo', 'resumen'])
            ->assertJsonPath('errors.tipo.0', 'Elija un tipo de proyecto de la lista.')
            ->assertJsonPath('errors.linea_id.0', 'Esa línea de investigación ya no existe. Elija otra.')
            ->assertJsonPath('errors.gestion.0', 'Escriba un año entre 1970 y '.(now()->year + 1).'.')
            ->assertJsonPath('errors.estado.0', 'Elija un estado de la lista.');
    }

    public function test_el_panel_ve_todo_incluso_lo_oculto(): void
    {
        $this->crear(['publicado' => false]);

        $this->actingAs($this->cuenta())
            ->getJson(self::GESTION)
            ->assertOk()
            ->assertJsonCount(1, 'proyectos')
            ->assertJsonCount(11, 'lineas')
            ->assertJsonPath('proyectos.0.publicado', false);
    }

    public function test_guarda_las_lineas_conservando_sus_ids(): void
    {
        $editor = $this->cuenta();
        $proyecto = $this->crear([], $editor);
        $lineas = Linea::orderBy('orden')->get();
        $marketing = $lineas->firstWhere('id', $proyecto->linea_id);

        // Se renombra la línea con proyectos, se agrega una nueva y se quitan las demás sin proyectos
        $this->actingAs($editor)
            ->putJson(self::GESTION.'/lineas', ['lineas' => [
                ['id' => null, 'nombre' => 'Turismo y Gestión Hotelera', 'descripcion' => 'Línea nueva.'],
                ['id' => $marketing->id, 'nombre' => 'Marketing y Consumidor', 'descripcion' => $marketing->descripcion],
            ]])
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.nombre', 'Turismo y Gestión Hotelera')
            ->assertJsonPath('data.1.id', $marketing->id)
            ->assertJsonPath('data.1.proyectos', 1);

        $this->assertSame($marketing->id, $proyecto->fresh()->linea_id);
        $this->assertDatabaseHas('bitacora', ['user_id' => $editor->id, 'recurso' => 'Investigación: líneas de investigación']);
    }

    public function test_no_deja_quitar_una_linea_con_proyectos(): void
    {
        $proyecto = $this->crear();
        $otras = Linea::whereKeyNot($proyecto->linea_id)->get(['id', 'nombre', 'descripcion'])->toArray();

        $this->actingAs($this->cuenta())
            ->putJson(self::GESTION.'/lineas', ['lineas' => $otras])
            ->assertUnprocessable()
            ->assertJsonPath('errors.lineas.0', 'No se puede quitar «Marketing, Inteligencia de Negocios y Comportamiento del Consumidor»: tiene 1 proyecto. Primero cámbielos de línea.');

        $this->assertDatabaseCount('investigacion_lineas', 11);

        $this->actingAs($this->cuenta())
            ->putJson(self::GESTION.'/lineas', ['lineas' => [
                ['nombre' => 'Repetida', 'descripcion' => 'Una.'],
                ['nombre' => 'repetida', 'descripcion' => 'Otra.'],
            ]])
            ->assertUnprocessable()
            ->assertJsonPath('errors', fn ($e) => $e['lineas.1.nombre'] === ['Ya hay otra línea con ese nombre.']);
    }

    public function test_guarda_los_textos_de_semilleros_y_pia(): void
    {
        $editor = $this->cuenta();

        $this->actingAs($editor)
            ->putJson(self::GESTION.'/complementos', [
                'semilleros_presentacion' => 'Espacio de investigación estudiantil.',
                'semilleros_mision' => '',
                'semilleros_vision' => null,
                'semilleros_objetivos' => "Primer objetivo.\r\nSegundo objetivo.",
                'semilleros_coordinador' => 'Lic. Saúl E. Lozano Morales',
                'pia_presentacion' => 'Proyectos de investigación en las asignaturas.',
                'instituto' => '',
                'semilleros' => [['nombre' => 'Semillero de Turismo', 'descripcion' => '']],
            ])
            ->assertOk()
            ->assertJsonPath('contenido.semilleros_mision', null)
            ->assertJsonPath('contenido.semilleros_objetivos', "Primer objetivo.\nSegundo objetivo.")
            ->assertJsonCount(1, 'semilleros')
            ->assertJsonPath('semilleros.0.descripcion', null);

        $this->assertDatabaseHas('bitacora', ['user_id' => $editor->id, 'recurso' => 'Investigación: semilleros y PIA']);
    }
}
