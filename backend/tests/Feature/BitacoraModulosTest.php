<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use Database\Seeders\PermisoSeeder;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/** CU-29: los cambios de noticias, eventos, vinculación e información académica también quedan en la bitácora. */
class BitacoraModulosTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RolSeeder::class, PermisoSeeder::class]);
    }

    private function cuenta(string $rol): User
    {
        return User::factory()->create(['rol_id' => Rol::where('slug', $rol)->value('id')]);
    }

    private function registrado(string $accion, string $recurso): bool
    {
        return DB::table('bitacora')->where('tipo', 'accion')->where('accion', $accion)->where('recurso', $recurso)->exists();
    }

    public function test_noticias_y_eventos(): void
    {
        $prensa = $this->cuenta(Rol::EDITOR_COMUNICACION);

        $noticia = $this->actingAs($prensa)->postJson('/api/noticias', ['titulo' => 'Nueva', 'resumen' => 'Resumen', 'contenido' => 'Texto', 'publicada' => true])->assertCreated()->json('data.id');
        $this->actingAs($prensa)->deleteJson("/api/noticias/{$noticia}")->assertOk();

        $evento = $this->actingAs($prensa)->postJson('/api/eventos', [
            'titulo' => 'Feria', 'descripcion' => 'Texto', 'fecha_inicio' => '2026-12-01 09:00', 'fecha_fin' => '2026-12-01 12:00', 'lugar' => 'FCEE', 'publicado' => true,
        ])->assertCreated()->json('data.id');

        $this->assertTrue($this->registrado('crear', "Noticia #{$noticia}"));
        $this->assertTrue($this->registrado('eliminar', "Noticia #{$noticia}"));
        $this->assertTrue($this->registrado('crear', "Evento #{$evento}"));
    }

    public function test_vinculacion_e_informacion_academica(): void
    {
        $editor = $this->cuenta(Rol::EDITOR_INSTITUCIONAL);

        $id = $this->actingAs($editor)->postJson('/api/vinculaciones', ['titulo' => 'Convenio', 'descripcion' => 'Texto', 'publicado' => true])->assertCreated()->json('data.id');
        $this->actingAs($editor)->putJson('/api/informacion-academica', ['mision' => 'M', 'vision' => 'V', 'perfil_profesional' => 'P', 'objetivos' => 'O'])->assertOk();

        $this->assertTrue($this->registrado('crear', "Vinculación #{$id}"));
        $this->assertTrue($this->registrado('editar', 'Información académica'));
    }
}
