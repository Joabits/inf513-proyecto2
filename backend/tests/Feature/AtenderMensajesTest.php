<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use App\Modulos\Contacto\MensajeContacto;
use Database\Seeders\PermisoSeeder;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/** CU-25 Atender mensajes de contacto. */
class AtenderMensajesTest extends TestCase
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

    private function mensaje(): MensajeContacto
    {
        return MensajeContacto::create(['nombre' => 'Ana', 'correo' => 'ana@ejemplo.com', 'asunto' => 'Inscripción', 'mensaje' => '¿Cuándo son las inscripciones?']);
    }

    public function test_solo_quien_tiene_permiso_ve_los_mensajes(): void
    {
        $this->mensaje();

        $this->getJson('/api/mensajes')->assertUnauthorized();
        $this->actingAs($this->cuenta(Rol::EDITOR_INSTITUCIONAL))->getJson('/api/mensajes')->assertForbidden();
        $this->actingAs($this->cuenta(Rol::EDITOR_COMUNICACION))->getJson('/api/mensajes')->assertOk()->assertJsonCount(1);
    }

    public function test_atender_guarda_la_nota_y_queda_en_la_bitacora(): void
    {
        $editor = $this->cuenta(Rol::EDITOR_COMUNICACION);
        $mensaje = $this->mensaje();

        $this->actingAs($editor)->putJson("/api/mensajes/{$mensaje->id}", ['atendido' => true, 'respuesta' => 'Le escribimos con las fechas.'])
            ->assertOk();

        $mensaje->refresh();
        $this->assertSame(MensajeContacto::ATENDIDO, $mensaje->estado);
        $this->assertTrue($mensaje->atendido());
        $this->assertSame($editor->id, $mensaje->atendido_por);
        $this->assertNotNull($mensaje->atendido_en);
        $this->assertSame('Le escribimos con las fechas.', $mensaje->respuesta);
        $this->assertTrue(DB::table('bitacora')->where('accion', 'atender')->where('recurso', "Mensaje de contacto #{$mensaje->id}")->exists());
    }

    public function test_se_puede_devolver_a_pendiente(): void
    {
        $editor = $this->cuenta(Rol::EDITOR_COMUNICACION);
        $mensaje = $this->mensaje();
        $this->actingAs($editor)->putJson("/api/mensajes/{$mensaje->id}", ['atendido' => true])->assertOk();

        $this->actingAs($editor)->putJson("/api/mensajes/{$mensaje->id}", ['atendido' => false])->assertOk();

        $mensaje->refresh();
        $this->assertSame(MensajeContacto::NUEVO, $mensaje->estado);
        $this->assertFalse($mensaje->atendido());
        $this->assertNull($mensaje->atendido_por);
        $this->assertNull($mensaje->atendido_en);
    }

    public function test_el_estado_solo_acepta_nuevo_o_atendido(): void
    {
        $mensaje = $this->mensaje();

        $this->actingAs($this->cuenta(Rol::EDITOR_COMUNICACION))->putJson("/api/mensajes/{$mensaje->id}", ['estado' => 'cualquier cosa'])
            ->assertUnprocessable()->assertJsonValidationErrors('estado');
    }

    public function test_eliminar_un_mensaje(): void
    {
        $mensaje = $this->mensaje();

        $this->actingAs($this->cuenta(Rol::EDITOR_INSTITUCIONAL))->deleteJson("/api/mensajes/{$mensaje->id}")->assertForbidden();
        $this->actingAs($this->cuenta(Rol::EDITOR_COMUNICACION))->deleteJson("/api/mensajes/{$mensaje->id}")->assertOk();

        $this->assertDatabaseMissing('mensajes_contacto', ['id' => $mensaje->id]);
        $this->assertTrue(DB::table('bitacora')->where('accion', 'eliminar')->where('recurso', "Mensaje de contacto #{$mensaje->id}")->exists());
    }
}
