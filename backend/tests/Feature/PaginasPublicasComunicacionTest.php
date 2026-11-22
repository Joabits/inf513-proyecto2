<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use Database\Seeders\PermisoSeeder;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * CU-01 y CU-06: lo que el visitante obtiene de noticias, eventos y galería. Solo lo publicado, sin la cuenta del
 * panel que cargó cada dato; y quien gestiona sigue viendo todo en el panel.
 */
class PaginasPublicasComunicacionTest extends TestCase
{
    use RefreshDatabase;

    private User $autor;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RolSeeder::class, PermisoSeeder::class]);
        $this->autor = User::factory()->create(['name' => 'Cuenta Interna Zafiro', 'rol_id' => Rol::where('slug', Rol::EDITOR_COMUNICACION)->value('id')]);
    }

    private function fila(string $tabla, array $datos): int
    {
        return DB::table($tabla)->insertGetId(['user_id' => $this->autor->id, 'created_at' => now(), 'updated_at' => now(), ...$datos]);
    }

    private function noticia(bool $publicada): int
    {
        return $this->fila('noticias', ['titulo' => $publicada ? 'Publicada' : 'Borrador', 'resumen' => 'Resumen.', 'contenido' => 'Texto completo de la noticia.', 'publicada' => $publicada, 'publicada_en' => $publicada ? now() : null]);
    }

    private function evento(bool $publicado): int
    {
        return $this->fila('eventos', ['titulo' => $publicado ? 'Publicado' : 'Oculto', 'descripcion' => 'Descripción.', 'lugar' => 'Auditorio', 'fecha_inicio' => now()->addDay(), 'fecha_fin' => now()->addDay()->addHours(2), 'publicado' => $publicado]);
    }

    public function test_el_visitante_no_obtiene_borradores_de_noticias_ni_pidiendo_todas_ni_por_numero(): void
    {
        $this->noticia(true);
        $borrador = $this->noticia(false);

        $this->getJson('/api/noticias?todas=1')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.titulo', 'Publicada');
        $this->getJson("/api/noticias/$borrador")->assertNotFound();
    }

    public function test_la_noticia_publica_no_lleva_la_cuenta_interna_y_el_listado_no_trae_el_texto_completo(): void
    {
        $id = $this->noticia(true);

        $listado = $this->getJson('/api/noticias')->assertOk();
        $this->assertArrayNotHasKey('contenido', $listado->json('data.0'), 'el listado no descarga cada texto completo');
        $this->assertStringNotContainsString('Zafiro', $listado->getContent());

        $detalle = $this->getJson("/api/noticias/$id")->assertOk()->assertJsonPath('data.contenido', 'Texto completo de la noticia.');
        $this->assertStringNotContainsString('Zafiro', $detalle->getContent());
    }

    public function test_quien_gestiona_noticias_sigue_viendo_borradores_y_autor_en_el_panel(): void
    {
        $this->noticia(true);
        $borrador = $this->noticia(false);

        $this->actingAs($this->autor)->getJson('/api/noticias?todas=1')->assertOk()->assertJsonCount(2, 'data')->assertJsonPath('data.0.autor', 'Cuenta Interna Zafiro');
        $this->actingAs($this->autor)->getJson("/api/noticias/$borrador")->assertOk()->assertJsonPath('data.publicada', false);
    }

    public function test_el_visitante_no_obtiene_eventos_ocultos_y_no_ve_la_cuenta_interna(): void
    {
        $this->evento(true);
        $oculto = $this->evento(false);

        $listado = $this->getJson('/api/eventos?solo_publicados=0')->assertOk()->assertJsonCount(1, 'data');
        $this->assertArrayNotHasKey('autor', $listado->json('data.0'));
        $this->assertStringNotContainsString('Zafiro', $listado->getContent());
        $this->getJson("/api/eventos/$oculto")->assertNotFound();
    }

    public function test_quien_gestiona_eventos_sigue_viendo_los_ocultos_en_el_panel(): void
    {
        $this->evento(true);
        $oculto = $this->evento(false);

        $this->actingAs($this->autor)->getJson('/api/eventos?solo_publicados=0')->assertOk()->assertJsonCount(2, 'data');
        $this->actingAs($this->autor)->getJson("/api/eventos/$oculto")->assertOk()->assertJsonPath('data.autor', 'Cuenta Interna Zafiro');
    }

    public function test_la_galeria_publica_no_lleva_la_cuenta_interna_y_el_panel_si(): void
    {
        $this->fila('galerias', ['titulo' => 'Acto', 'descripcion' => 'Foto.', 'imagen' => 'galeria/a.jpg', 'publicado' => true]);

        $publica = $this->getJson('/api/galeria')->assertOk();
        $this->assertArrayNotHasKey('autor', $publica->json('data.0'));
        $this->assertStringNotContainsString('Zafiro', $publica->getContent());

        $this->actingAs($this->autor)->getJson('/api/galeria')->assertOk()->assertJsonPath('data.0.autor', 'Cuenta Interna Zafiro');
    }
}
