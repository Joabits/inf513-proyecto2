<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use App\Modulos\Eventos\Model as Evento;
use App\Modulos\Galeria\Model as Galeria;
use App\Modulos\Graduados\Model as Graduado;
use App\Modulos\InformacionAcademica\Model as InformacionAcademica;
use App\Modulos\Noticias\Model as Noticia;
use App\Modulos\Vinculacion\Model as Vinculacion;
use Database\Seeders\PermisoSeeder;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Eliminar una cuenta (CU-26) no debe borrar lo que esa persona publicó o registró. */
class ConservarContenidoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RolSeeder::class, PermisoSeeder::class]);
    }

    public function test_eliminar_una_cuenta_conserva_su_contenido_sin_autor(): void
    {
        $director = User::factory()->create(['rol_id' => Rol::where('slug', Rol::DIRECTOR)->value('id')]);
        $editor = User::factory()->create(['rol_id' => Rol::where('slug', Rol::EDITOR_COMUNICACION)->value('id')]);
        $id = $editor->id;

        Noticia::create(['titulo' => 'Noticia', 'resumen' => 'Resumen', 'contenido' => 'Texto', 'publicada' => true, 'user_id' => $id]);
        Evento::create(['titulo' => 'Evento', 'descripcion' => 'Texto', 'fecha_inicio' => '2026-12-01 09:00', 'fecha_fin' => '2026-12-01 12:00', 'lugar' => 'FCEE', 'publicado' => true, 'user_id' => $id]);
        Galeria::create(['titulo' => 'Foto', 'imagen' => 'galeria/foto.jpg', 'publicado' => true, 'user_id' => $id]);
        Vinculacion::create(['titulo' => 'Convenio', 'descripcion' => 'Texto', 'publicado' => true, 'user_id' => $id]);
        InformacionAcademica::create(['mision' => 'M', 'vision' => 'V', 'perfil_profesional' => 'P', 'objetivos' => 'O', 'user_id' => $id]);
        Graduado::create(['nombre_completo' => 'Ana Paz', 'ci' => '123', 'gestion_ingreso' => 'I-2018', 'gestion_egreso' => 'II-2023', 'modalidad' => 'Tesis de Grado', 'user_id' => $id]);

        $this->actingAs($director)->deleteJson("/api/gestion/usuarios/{$id}")->assertSuccessful();

        $this->assertDatabaseMissing('users', ['id' => $id]);
        foreach ([Noticia::class, Evento::class, Galeria::class, Vinculacion::class, InformacionAcademica::class, Graduado::class] as $modelo) {
            $this->assertSame(1, $modelo::count(), "{$modelo} se borró al eliminar la cuenta");
            $this->assertNull($modelo::first()->user_id);
        }
    }
}
