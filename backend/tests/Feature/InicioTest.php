<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use App\Modulos\Inicio\Banner;
use App\Modulos\Inicio\Cifra;
use App\Modulos\Inicio\Portada;
use Database\Seeders\InicioSeeder;
use Database\Seeders\PermisoSeeder;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class InicioTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RolSeeder::class, PermisoSeeder::class, InicioSeeder::class]);
    }

    public function test_el_visitante_consulta_la_portada_sin_iniciar_sesion(): void
    {
        $this->getJson('/api/inicio')
            ->assertOk()
            ->assertJsonPath('portada.titulo', 'Administración de Empresas')
            ->assertJsonPath('portada.director_foto', null)
            ->assertJsonCount(0, 'banners')
            ->assertJsonCount(4, 'cifras')
            ->assertJsonCount(4, 'accesos');
    }

    public function test_las_listas_respetan_el_orden(): void
    {
        Cifra::where('valor', '47')->update(['orden' => 0]);
        Cifra::where('valor', '1970')->update(['orden' => 9]);

        $valores = collect($this->getJson('/api/inicio')->json('cifras'))->pluck('valor');

        $this->assertSame('47', $valores->first());
        $this->assertSame('1970', $valores->last());
    }

    public function test_el_seeder_no_borra_lo_editado(): void
    {
        Cifra::query()->delete();

        $this->seed(InicioSeeder::class);

        $this->assertSame(0, Cifra::count());
    }

    private function editor(string $rol = Rol::EDITOR_INSTITUCIONAL): User
    {
        return User::factory()->create(['rol_id' => Rol::where('slug', $rol)->value('id')]);
    }

    private function portadaValida(array $cambios = []): array
    {
        return [
            'distintivo' => 'Acreditada',
            'titulo' => 'Título nuevo',
            'presentacion' => 'Bienvenida nueva',
            'director_nombre' => 'Nombre',
            'director_cargo' => 'Cargo',
            'director_mensaje' => 'Mensaje nuevo',
            ...$cambios,
        ];
    }

    public function test_editar_la_portada_exige_sesion_y_permiso(): void
    {
        $this->putJson('/api/inicio/portada', $this->portadaValida())->assertUnauthorized();

        $this->actingAs($this->editor(Rol::EDITOR_COMUNICACION))
            ->putJson('/api/inicio/portada', $this->portadaValida())
            ->assertForbidden();

        $this->assertSame('Administración de Empresas', Portada::first()->titulo);
    }

    public function test_el_editor_actualiza_la_portada_y_queda_en_la_bitacora(): void
    {
        $this->actingAs($this->editor())
            ->putJson('/api/inicio/portada', $this->portadaValida())
            ->assertOk()
            ->assertJsonPath('portada.titulo', 'Título nuevo');

        $this->assertSame(1, Portada::count());
        $this->assertSame(1, DB::table('bitacora')->where('recurso', 'Página de inicio: presentación y mensaje')->count());
    }

    public function test_valida_la_portada_en_espanol(): void
    {
        $this->actingAs($this->editor())
            ->putJson('/api/inicio/portada', $this->portadaValida(['presentacion' => '']))
            ->assertUnprocessable()
            ->assertJsonPath('errors.presentacion.0', 'El campo texto de bienvenida es obligatorio.');
    }

    public function test_guardar_cifras_reemplaza_la_lista_en_ese_orden(): void
    {
        $cifras = [['valor' => '2', 'etiqueta' => 'Segunda'], ['valor' => '1', 'etiqueta' => 'Primera']];

        $this->actingAs($this->editor())
            ->putJson('/api/inicio/cifras', ['cifras' => $cifras])
            ->assertOk()
            ->assertJsonCount(2, 'cifras')
            ->assertJsonPath('cifras.0.etiqueta', 'Segunda');
    }

    public function test_se_pueden_quitar_todas_las_cifras(): void
    {
        $this->actingAs($this->editor())
            ->putJson('/api/inicio/cifras', ['cifras' => []])
            ->assertOk()
            ->assertJsonCount(0, 'cifras');
    }

    public function test_no_acepta_mas_de_ocho_cifras(): void
    {
        $cifras = array_fill(0, 9, ['valor' => '1', 'etiqueta' => 'Cifra']);

        $this->actingAs($this->editor())->putJson('/api/inicio/cifras', ['cifras' => $cifras])->assertUnprocessable();
    }

    public function test_acepta_rutas_internas_y_enlaces_seguros(): void
    {
        $accesos = [
            ['titulo' => 'Interna', 'descripcion' => 'Texto', 'ruta' => '/malla-curricular'],
            ['titulo' => 'Externa', 'descripcion' => 'Texto', 'ruta' => 'https://www.uagrm.edu.bo'],
        ];

        $this->actingAs($this->editor())->putJson('/api/inicio/accesos', ['accesos' => $accesos])->assertOk()->assertJsonCount(2, 'accesos');
    }

    private function subirBanner(User $usuario, string $alt = 'Aula de clases')
    {
        return $this->actingAs($usuario)->post('/api/inicio/banners', [
            'imagen' => UploadedFile::fake()->image('aula.jpg', 1600, 600),
            'texto_alternativo' => $alt,
        ], ['Accept' => 'application/json']);
    }

    public function test_sube_un_banner_y_lo_muestra_en_la_portada(): void
    {
        Storage::fake('public');

        $this->subirBanner($this->editor())
            ->assertOk()
            ->assertJsonCount(1, 'banners')
            ->assertJsonPath('banners.0.texto_alternativo', 'Aula de clases');

        Storage::disk('public')->assertExists(Banner::first()->imagen);
    }

    public function test_el_banner_exige_descripcion_y_tamano_minimo(): void
    {
        Storage::fake('public');

        $this->actingAs($this->editor())->post('/api/inicio/banners', [
            'imagen' => UploadedFile::fake()->image('chica.jpg', 300, 200),
        ], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'imagen' => 'La imagen debe medir al menos 1200 × 400 píxeles.',
                'texto_alternativo' => 'El campo descripción de la imagen es obligatorio.',
            ]);
    }

    public function test_no_acepta_mas_de_cinco_banners(): void
    {
        Storage::fake('public');
        $usuario = $this->editor();

        foreach (range(1, 5) as $numero) {
            $this->subirBanner($usuario)->assertOk();
        }

        $this->subirBanner($usuario)->assertUnprocessable()->assertJsonValidationErrors('imagen');
        $this->assertSame(5, Banner::count());
    }

    public function test_eliminar_un_banner_borra_el_archivo(): void
    {
        Storage::fake('public');
        $usuario = $this->editor();
        $this->subirBanner($usuario)->assertOk();
        $banner = Banner::first();

        $this->actingAs($usuario)->deleteJson("/api/inicio/banners/{$banner->id}")->assertOk()->assertJsonCount(0, 'banners');

        Storage::disk('public')->assertMissing($banner->imagen);
    }

    public function test_cambia_el_orden_de_los_banners(): void
    {
        Storage::fake('public');
        $usuario = $this->editor();
        $this->subirBanner($usuario, 'Primero')->assertOk();
        $this->subirBanner($usuario, 'Segundo')->assertOk();
        $ids = Banner::orderBy('orden')->pluck('id')->reverse()->values()->all();

        $this->actingAs($usuario)->putJson('/api/inicio/banners/orden', ['ids' => $ids])
            ->assertOk()
            ->assertJsonPath('banners.0.texto_alternativo', 'Segundo');
    }

    public function test_cambiar_la_foto_del_director_reemplaza_la_anterior(): void
    {
        Storage::fake('public');
        $usuario = $this->editor();

        $this->actingAs($usuario)->post('/api/inicio/portada/foto', ['foto' => UploadedFile::fake()->image('a.jpg')], ['Accept' => 'application/json'])->assertOk();
        $anterior = Portada::first()->director_foto;

        $this->actingAs($usuario)->post('/api/inicio/portada/foto', ['foto' => UploadedFile::fake()->image('b.jpg')], ['Accept' => 'application/json'])->assertOk();

        Storage::disk('public')->assertMissing($anterior);
        Storage::disk('public')->assertExists(Portada::first()->director_foto);

        $this->actingAs($usuario)->deleteJson('/api/inicio/portada/foto')->assertOk()->assertJsonPath('portada.director_foto', null);
    }

    public function test_las_imagenes_exigen_permiso(): void
    {
        Storage::fake('public');

        $this->subirBanner($this->editor(Rol::EDITOR_COMUNICACION))->assertForbidden();
        $this->assertSame(0, Banner::count());
    }

    public function test_rechaza_enlaces_inseguros(): void
    {
        $usuario = $this->editor();

        foreach (['javascript:alert(1)', 'http://sitio.com', '//sitio.com'] as $ruta) {
            $this->actingAs($usuario)
                ->putJson('/api/inicio/accesos', ['accesos' => [['titulo' => 'A', 'descripcion' => 'B', 'ruta' => $ruta]]])
                ->assertUnprocessable()
                ->assertJsonValidationErrors(['accesos.0.ruta' => 'El enlace debe empezar con / o con https://.']);
        }
    }
}
