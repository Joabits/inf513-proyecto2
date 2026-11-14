<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use App\Modulos\Docentes\Persona;
use Database\Seeders\PermisoSeeder;
use Database\Seeders\PersonalCarreraSeeder;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DocentesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RolSeeder::class, PermisoSeeder::class, PersonalCarreraSeeder::class]);
        Storage::fake('public');
    }

    private function editor(string $rol = Rol::EDITOR_INSTITUCIONAL): User
    {
        return User::factory()->create(['rol_id' => Rol::where('slug', $rol)->value('id')]);
    }

    private function datos(array $cambios = []): array
    {
        return ['nombre' => 'Lic. Ana Pérez', 'cargo' => 'Docente de Marketing', 'grupo' => 'docente', 'visible' => '1', 'destacado' => '0', ...$cambios];
    }

    public function test_el_seeder_carga_autoridades_y_administrativos_del_documento(): void
    {
        $this->assertSame(5, Persona::where('grupo', 'autoridad')->count());
        $this->assertSame(5, Persona::where('grupo', 'administrativo')->count());
        $this->assertSame(0, Persona::where('grupo', 'docente')->count());
        $this->assertSame('Lic. Freddy Fuentes Soliz', Persona::where('cargo', 'Director de Carrera')->value('nombre'));
    }

    public function test_el_rector_y_la_vicerrectora_se_cargan_ocultos_y_el_director_destacado(): void
    {
        $ocultos = Persona::where('visible', false)->pluck('cargo')->all();
        sort($ocultos);

        $this->assertSame(['Rector U.A.G.R.M.', 'Vicerrectora U.A.G.R.M.'], $ocultos);
        $this->assertSame(['Director de Carrera'], Persona::where('destacado', true)->pluck('cargo')->all());
    }

    public function test_el_seeder_no_borra_lo_editado(): void
    {
        Persona::query()->delete();

        $this->seed(PersonalCarreraSeeder::class);

        $this->assertSame(10, Persona::count());

        Persona::first()->delete();
        $this->seed(PersonalCarreraSeeder::class);

        $this->assertSame(9, Persona::count());
    }

    public function test_el_visitante_solo_ve_a_las_personas_visibles_en_orden(): void
    {
        $datos = $this->getJson('/api/docentes')->assertOk()->json('data');
        $nombres = collect($datos)->pluck('nombre');

        $this->assertCount(8, $nombres);
        $this->assertNotContains('Dr. Reinerio Vargas Banegas', $nombres);
        $this->assertNotContains('Ing. Juana Borja Saavedra', $nombres);
        $this->assertSame('Lic. Ricardo Terrazas Soto', $nombres->first());

        // Publicar al Rector desde el panel lo hace aparecer, sin tocar código
        Persona::where('cargo', 'Rector U.A.G.R.M.')->update(['visible' => true]);

        $this->assertContains('Dr. Reinerio Vargas Banegas', collect($this->getJson('/api/docentes')->json('data'))->pluck('nombre'));
    }

    public function test_la_api_marca_a_la_persona_destacada(): void
    {
        $destacadas = collect($this->getJson('/api/docentes')->json('data'))->where('destacado', true);

        $this->assertCount(1, $destacadas);
        $this->assertSame('Lic. Freddy Fuentes Soliz', $destacadas->first()['nombre']);
    }

    public function test_el_editor_puede_destacar_a_otra_persona(): void
    {
        $persona = Persona::where('cargo', 'Decano F.C.E.E.')->first();

        $this->actingAs($this->editor())
            ->putJson("/api/gestion/docentes/{$persona->id}", ['nombre' => $persona->nombre, 'cargo' => $persona->cargo, 'grupo' => 'autoridad', 'visible' => true, 'destacado' => true])
            ->assertOk()
            ->assertJsonPath('data.destacado', true);
    }

    public function test_gestionar_exige_sesion_y_permiso(): void
    {
        $this->getJson('/api/gestion/docentes')->assertUnauthorized();

        $this->actingAs($this->editor(Rol::EDITOR_COMUNICACION))
            ->postJson('/api/gestion/docentes', $this->datos())
            ->assertForbidden();
    }

    public function test_el_editor_agrega_un_docente_al_final_de_su_grupo_y_queda_en_la_bitacora(): void
    {
        $editor = $this->editor();
        $this->actingAs($editor)->postJson('/api/gestion/docentes', $this->datos())->assertCreated();
        $id = $this->postJson('/api/gestion/docentes', $this->datos(['nombre' => 'Lic. Luis Rocha']))->assertCreated()->json('data.id');

        $this->assertSame(1, Persona::find($id)->orden);
        $this->assertSame(1, DB::table('bitacora')->where('accion', 'crear')->where('recurso', 'Persona #'.$id)->count());
    }

    public function test_valida_el_grupo_y_la_foto(): void
    {
        $this->actingAs($this->editor())
            ->post('/api/gestion/docentes', $this->datos([
                'grupo' => 'estudiante',
                'foto' => UploadedFile::fake()->image('chica.jpg', 120, 120),
            ]), ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['grupo', 'foto' => '300 × 300']);
    }

    public function test_subir_cambiar_y_quitar_la_foto_borra_la_anterior(): void
    {
        $this->actingAs($this->editor());
        $persona = Persona::where('cargo', 'Director de Carrera')->first();
        $ruta = "/api/gestion/docentes/{$persona->id}";
        $base = ['nombre' => $persona->nombre, 'cargo' => $persona->cargo, 'grupo' => 'autoridad', 'visible' => '1', 'destacado' => '0', '_method' => 'PUT'];

        $this->post($ruta, [...$base, 'foto' => UploadedFile::fake()->image('a.jpg', 400, 500)], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('data.foto', fn ($url) => str_contains($url, '/storage/personal/'));
        $primera = $persona->refresh()->foto;

        $this->post($ruta, [...$base, 'foto' => UploadedFile::fake()->image('b.jpg', 400, 500)], ['Accept' => 'application/json'])->assertOk();
        Storage::disk('public')->assertMissing($primera);
        $segunda = $persona->refresh()->foto;

        $this->post($ruta, [...$base, 'quitar_foto' => '1'], ['Accept' => 'application/json'])->assertOk()->assertJsonPath('data.foto', null);
        Storage::disk('public')->assertMissing($segunda);
    }

    public function test_cambiar_de_grupo_lo_pone_al_final_del_grupo_nuevo(): void
    {
        $persona = Persona::where('cargo', 'Secretaria de Dirección')->first();

        $this->actingAs($this->editor())
            ->putJson("/api/gestion/docentes/{$persona->id}", ['nombre' => $persona->nombre, 'cargo' => $persona->cargo, 'grupo' => 'autoridad', 'visible' => true, 'destacado' => false])
            ->assertOk();

        $this->assertSame(5, $persona->refresh()->orden);
    }

    public function test_ordenar_solo_acepta_personas_del_mismo_grupo(): void
    {
        $this->actingAs($this->editor());
        $autoridades = Persona::where('grupo', 'autoridad')->orderBy('orden')->pluck('id');
        $administrativo = Persona::where('grupo', 'administrativo')->value('id');

        $this->putJson('/api/gestion/docentes/orden', ['grupo' => 'autoridad', 'ids' => [...$autoridades->slice(1), $administrativo]])
            ->assertUnprocessable();

        $this->putJson('/api/gestion/docentes/orden', ['grupo' => 'autoridad', 'ids' => $autoridades->reverse()->values()->all()])
            ->assertOk();

        $this->assertSame('Lic. Freddy Fuentes Soliz', $this->getJson('/api/docentes')->json('data.0.nombre'));
    }

    public function test_eliminar_borra_a_la_persona_y_su_foto(): void
    {
        $this->actingAs($this->editor());
        $id = $this->post('/api/gestion/docentes', $this->datos(['foto' => UploadedFile::fake()->image('c.jpg', 400, 400)]), ['Accept' => 'application/json'])
            ->assertCreated()
            ->json('data.id');
        $foto = Persona::find($id)->foto;

        $this->deleteJson("/api/gestion/docentes/{$id}")->assertNoContent();

        $this->assertNull(Persona::find($id));
        Storage::disk('public')->assertMissing($foto);
    }
}
