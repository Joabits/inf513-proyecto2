<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/** CU-07: el buscador encuentra noticias, eventos y fotos publicados, y nada de lo que está oculto. */
class BusquedaComunicacionTest extends TestCase
{
    use RefreshDatabase;

    private function buscar(string $q)
    {
        return $this->getJson('/api/buscar?'.http_build_query(['q' => $q]));
    }

    private function grupo($respuesta, string $tipo): ?array
    {
        return collect($respuesta->json('grupos'))->firstWhere('tipo', $tipo);
    }

    private function insertar(string $tabla, array $datos): int
    {
        return DB::table($tabla)->insertGetId(['user_id' => User::factory()->create()->id, 'created_at' => now(), 'updated_at' => now(), ...$datos]);
    }

    public function test_encuentra_noticias_publicadas_por_titulo_resumen_o_texto_y_no_los_borradores(): void
    {
        $id = $this->insertar('noticias', ['titulo' => 'Feria de emprendimiento', 'resumen' => 'Estudiantes presentan proyectos.', 'contenido' => 'Participaron empresas de la región.', 'publicada' => true, 'publicada_en' => '2026-11-10 09:00:00']);
        $this->insertar('noticias', ['titulo' => 'Emprendimiento oculto', 'resumen' => 'Borrador.', 'contenido' => 'Texto.', 'publicada' => false]);

        $porTitulo = $this->grupo($this->buscar('emprendimiento')->assertOk(), 'noticia');
        $this->assertSame(1, $porTitulo['total'], 'el borrador no aparece');
        $this->assertSame("/noticias/$id", $porTitulo['resultados'][0]['ruta']);
        $this->assertStringContainsString('10 nov. 2026', $porTitulo['resultados'][0]['meta']);

        $porTexto = $this->grupo($this->buscar('region'), 'noticia');
        $this->assertSame($id, (int) basename($porTexto['resultados'][0]['ruta']), 'también se encuentra por el texto de la noticia, sin tildes');
        $this->assertStringContainsString('región', $porTexto['resultados'][0]['resumen'], 'muestra el fragmento donde coincide');
    }

    public function test_encuentra_eventos_publicados_por_titulo_descripcion_o_lugar(): void
    {
        $this->insertar('eventos', ['titulo' => 'Seminario de liderazgo', 'descripcion' => 'Charla sobre gestión de equipos.', 'lugar' => 'Auditorio Central', 'fecha_inicio' => '2026-12-05 09:00:00', 'fecha_fin' => '2026-12-05 12:00:00', 'publicado' => true]);
        $this->insertar('eventos', ['titulo' => 'Seminario oculto', 'descripcion' => 'No publicado.', 'lugar' => 'Auditorio Central', 'fecha_inicio' => '2026-12-06 09:00:00', 'fecha_fin' => '2026-12-06 12:00:00', 'publicado' => false]);

        $porLugar = $this->grupo($this->buscar('auditorio')->assertOk(), 'evento');

        $this->assertSame(1, $porLugar['total'], 'el evento sin publicar no aparece');
        $this->assertSame('Seminario de liderazgo', $porLugar['resultados'][0]['titulo']);
        $this->assertSame('/eventos', $porLugar['resultados'][0]['ruta']);
        $this->assertStringContainsString('Auditorio Central', $porLugar['resultados'][0]['meta']);
        $this->assertSame('Eventos académicos', $porLugar['etiqueta']);
    }

    public function test_encuentra_fotos_publicadas_y_no_las_ocultas(): void
    {
        $this->insertar('galerias', ['titulo' => 'Acto de graduación', 'descripcion' => 'Nuevos profesionales.', 'imagen' => 'galeria/a.jpg', 'publicado' => true]);
        $this->insertar('galerias', ['titulo' => 'Graduación oculta', 'descripcion' => 'No publicada.', 'imagen' => 'galeria/b.jpg', 'publicado' => false]);
        $this->insertar('galerias', ['titulo' => null, 'descripcion' => 'Foto sin título del campus.', 'imagen' => 'galeria/c.jpg', 'publicado' => true]);

        $grupo = $this->grupo($this->buscar('graduacion')->assertOk(), 'foto');
        $this->assertSame(1, $grupo['total'], 'la foto oculta no aparece');
        $this->assertSame('Acto de graduación', $grupo['resultados'][0]['titulo']);
        $this->assertSame('/galeria', $grupo['resultados'][0]['ruta']);

        $sinTitulo = $this->grupo($this->buscar('campus'), 'foto');
        $this->assertSame('Foto sin título', $sinTitulo['resultados'][0]['titulo'], 'una foto sin título se muestra con un nombre neutro');
    }

    public function test_los_autores_internos_nunca_se_buscan(): void
    {
        $autor = User::factory()->create(['name' => 'Marcador Interno Zafiro', 'email' => 'zafiro.interno@cae.test']);
        DB::table('noticias')->insert(['titulo' => 'Noticia sin relación', 'resumen' => 'Resumen.', 'contenido' => 'Texto.', 'publicada' => true, 'user_id' => $autor->id, 'created_at' => now(), 'updated_at' => now()]);

        $this->buscar('zafiro')->assertOk()->assertJsonPath('total', 0);
    }
}
