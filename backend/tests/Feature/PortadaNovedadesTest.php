<?php

namespace Tests\Feature;

use App\Models\User;
use App\Modulos\Eventos\EventosPortada;
use App\Modulos\Noticias\NoticiasPortada;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/** CU-01: las noticias y los próximos eventos aparecen en la portada, con lo publicado y nada más. */
class PortadaNovedadesTest extends TestCase
{
    use RefreshDatabase;

    private function noticia(string $titulo, bool $publicada, string $fecha): void
    {
        DB::table('noticias')->insert([
            'titulo' => $titulo, 'resumen' => "Resumen de $titulo", 'contenido' => 'Texto',
            'publicada' => $publicada, 'publicada_en' => $publicada ? $fecha : null,
            'user_id' => User::factory()->create()->id, 'created_at' => $fecha, 'updated_at' => $fecha,
        ]);
    }

    private function evento(string $titulo, bool $publicado, string $inicio, string $fin): void
    {
        DB::table('eventos')->insert([
            'titulo' => $titulo, 'descripcion' => 'Descripción', 'lugar' => 'Auditorio',
            'fecha_inicio' => $inicio, 'fecha_fin' => $fin, 'publicado' => $publicado,
            'user_id' => User::factory()->create()->id, 'created_at' => now(), 'updated_at' => now(),
        ]);
    }

    public function test_la_portada_trae_las_ultimas_noticias_publicadas(): void
    {
        $this->noticia('Antigua', true, '2026-01-01 10:00:00');
        $this->noticia('Borrador', false, '2026-11-20 10:00:00');
        foreach (['Primera', 'Segunda', 'Tercera'] as $i => $titulo) {
            $this->noticia($titulo, true, '2026-11-1'.($i + 1).' 10:00:00');
        }

        $noticias = $this->getJson('/api/inicio')->assertOk()->json('secciones.noticias');

        $this->assertSame(['Tercera', 'Segunda', 'Primera'], array_column($noticias, 'titulo'), 'de la más reciente a la más antigua, sin borradores');
        $this->assertCount(NoticiasPortada::CANTIDAD, $noticias);
        $this->assertSame(['id', 'titulo', 'resumen', 'imagen', 'fecha', 'ruta'], array_keys($noticias[0]), 'solo lo que muestra la portada, sin el contenido completo');
        $this->assertSame('/noticias/'.$noticias[0]['id'], $noticias[0]['ruta']);
    }

    public function test_la_portada_trae_solo_los_proximos_eventos_publicados(): void
    {
        $this->travelTo('2026-11-21 12:00:00');
        $this->evento('Ya terminó', true, '2026-11-01 09:00:00', '2026-11-01 12:00:00');
        $this->evento('Oculto', false, '2026-11-25 09:00:00', '2026-11-25 12:00:00');
        $this->evento('En curso', true, '2026-11-20 09:00:00', '2026-11-22 18:00:00');
        $this->evento('Diciembre', true, '2026-12-05 09:00:00', '2026-12-05 12:00:00');
        $this->evento('Próxima semana', true, '2026-11-28 09:00:00', '2026-11-28 12:00:00');
        $this->evento('Enero', true, '2027-01-10 09:00:00', '2027-01-10 12:00:00');

        $eventos = $this->getJson('/api/inicio')->assertOk()->json('secciones.eventos');

        $this->assertSame(['En curso', 'Próxima semana', 'Diciembre'], array_column($eventos, 'titulo'), 'del más cercano al más lejano; sigue el que aún no termina');
        $this->assertCount(EventosPortada::CANTIDAD, $eventos);
    }

    public function test_sin_noticias_ni_eventos_las_secciones_llegan_vacias(): void
    {
        $this->getJson('/api/inicio')
            ->assertOk()
            ->assertJsonPath('secciones.noticias', [])
            ->assertJsonPath('secciones.eventos', []);
    }
}
