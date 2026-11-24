<?php

namespace Tests\Feature;

use App\Models\User;
use App\Modulos\Galeria\GaleriaPortada;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/** CU-01: los logos de los convenios y las últimas fotos de la galería aparecen en la portada, solo lo publicado. */
class PortadaAlianzasGaleriaTest extends TestCase
{
    use RefreshDatabase;

    private function convenio(string $titulo, bool $publicado, ?string $imagen): void
    {
        DB::table('vinculaciones')->insert([
            'titulo' => $titulo, 'descripcion' => 'Descripción', 'enlace' => null, 'imagen' => $imagen,
            'publicado' => $publicado, 'user_id' => User::factory()->create()->id, 'created_at' => now(), 'updated_at' => now(),
        ]);
    }

    private function foto(string $titulo, bool $publicado, string $fecha, string $imagen = 'galeria/foto.jpg'): void
    {
        DB::table('galerias')->insert([
            'titulo' => $titulo, 'descripcion' => null, 'imagen' => $imagen, 'publicado' => $publicado,
            'user_id' => User::factory()->create()->id, 'created_at' => $fecha, 'updated_at' => $fecha,
        ]);
    }

    public function test_la_portada_trae_los_logos_de_los_convenios_publicados(): void
    {
        $this->convenio('Con logo', true, 'vinculacion/logo.jpg');
        $this->convenio('Sin logo', true, null);
        $this->convenio('Oculto', false, 'vinculacion/otro.jpg');

        $alianzas = $this->getJson('/api/inicio')->assertOk()->json('secciones.alianzas');

        $this->assertSame(['Con logo'], array_column($alianzas, 'titulo'), 'solo los publicados que tienen logo');
        $this->assertSame(['id', 'titulo', 'imagen'], array_keys($alianzas[0]), 'sin descripción ni datos del panel');
        $this->assertStringEndsWith('/storage/vinculacion/logo.jpg', $alianzas[0]['imagen']);
    }

    public function test_la_portada_trae_las_fotos_mas_recientes_de_la_galeria(): void
    {
        foreach (range(1, 8) as $dia) {
            $this->foto("Foto $dia", true, sprintf('2026-11-%02d 10:00:00', $dia));
        }
        $this->foto('Oculta y más nueva', false, '2026-11-20 10:00:00');
        $this->foto('Externa', true, '2026-11-09 10:00:00', 'https://www.uagrm.edu.bo/foto.jpg');

        $galeria = $this->getJson('/api/inicio')->assertOk()->json('secciones.galeria');

        $this->assertCount(GaleriaPortada::CANTIDAD, $galeria);
        $this->assertSame(['Externa', 'Foto 8', 'Foto 7', 'Foto 6', 'Foto 5'], array_column($galeria, 'titulo'), 'de la más reciente a la más antigua, sin las ocultas');
        $this->assertSame('https://www.uagrm.edu.bo/foto.jpg', $galeria[0]['imagen'], 'una dirección externa queda tal cual');
    }

    public function test_sin_convenios_ni_fotos_las_secciones_llegan_vacias(): void
    {
        $this->getJson('/api/inicio')
            ->assertOk()
            ->assertJsonPath('secciones.alianzas', [])
            ->assertJsonPath('secciones.galeria', []);
    }
}
