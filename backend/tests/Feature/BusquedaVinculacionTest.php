<?php

namespace Tests\Feature;

use App\Models\User;
use App\Modulos\InformacionAcademica\Model as InformacionAcademica;
use App\Modulos\Innova\ServicioInnova;
use App\Modulos\Vinculacion\Model as Vinculacion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** CU-07: el buscador también encuentra convenios publicados, la información académica y los servicios de INNOVA. */
class BusquedaVinculacionTest extends TestCase
{
    use RefreshDatabase;

    private function tipos(string $q): array
    {
        return collect($this->getJson('/api/buscar?q='.urlencode($q))->assertOk()->json('grupos'))->pluck('tipo')->all();
    }

    public function test_encuentra_convenios_publicados_pero_no_borradores(): void
    {
        $autor = User::factory()->create();
        Vinculacion::create(['titulo' => 'Convenio con la Cámara de Industria', 'descripcion' => 'Prácticas.', 'publicado' => true, 'user_id' => $autor->id]);
        Vinculacion::create(['titulo' => 'Convenio secreto con Zeta', 'descripcion' => 'Borrador.', 'publicado' => false, 'user_id' => $autor->id]);

        $this->assertContains('vinculacion', $this->tipos('Cámara de Industria'));
        $this->assertNotContains('vinculacion', $this->tipos('Zeta'));
    }

    public function test_encuentra_informacion_academica_y_servicios_de_innova(): void
    {
        InformacionAcademica::create(['mision' => 'Formar líderes', 'vision' => 'Ser referentes', 'perfil_profesional' => 'Gerente', 'objetivos' => 'Alta gerencia y finanzas']);
        ServicioInnova::create(['nombre' => 'Estudio de mercado', 'descripcion' => 'Análisis de clientes y competencia.', 'orden' => 0]);

        $this->assertContains('informacion_academica', $this->tipos('alta gerencia'));
        $this->assertContains('servicio_innova', $this->tipos('estudio de mercado'));
    }
}
