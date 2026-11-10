<?php

namespace Tests\Feature;

use App\Modulos\Inicio\Cifra;
use Database\Seeders\InicioSeeder;
use Database\Seeders\PermisoSeeder;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
}
