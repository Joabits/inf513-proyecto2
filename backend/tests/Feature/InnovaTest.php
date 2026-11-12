<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use App\Modulos\Innova\Innova;
use App\Modulos\Innova\ServicioInnova;
use App\Modulos\Innova\SolicitudInnova;
use Database\Seeders\InnovaSeeder;
use Database\Seeders\PermisoSeeder;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InnovaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RolSeeder::class, PermisoSeeder::class, InnovaSeeder::class]);
    }

    private function cuenta(string $rol = Rol::EDITOR_INSTITUCIONAL): User
    {
        return User::factory()->create(['rol_id' => Rol::where('slug', $rol)->value('id')]);
    }

    private function solicitud(array $cambios = []): array
    {
        return [
            'nombre' => 'Carlos Méndez',
            'organizacion' => '  Panadería El Trigal  ',
            'correo' => 'Carlos.Mendez@Gmail.com',
            'telefono' => '',
            'servicio_id' => ServicioInnova::where('nombre', 'Plan de negocios')->value('id'),
            'descripcion' => 'Queremos abrir una segunda sucursal y necesitamos un plan de negocios.',
            ...$cambios,
        ];
    }

    // ---------- CU-22 Gestionar Empresa Junior INNOVA ----------

    public function test_la_pagina_publica_muestra_la_presentacion_y_los_servicios(): void
    {
        $this->getJson('/api/innova')
            ->assertOk()
            ->assertJsonPath('contenido.recibe_solicitudes', true)
            ->assertJsonCount(4, 'servicios')
            ->assertJsonPath('servicios.0.nombre', 'Plan de negocios');
    }

    public function test_editar_la_pagina_exige_permiso(): void
    {
        $datos = ['presentacion' => str_repeat('Texto de INNOVA. ', 3), 'recibe_solicitudes' => true];

        $this->putJson('/api/innova/contenido', $datos)->assertUnauthorized();
        $this->actingAs($this->cuenta(Rol::EDITOR_COMUNICACION))->putJson('/api/innova/contenido', $datos)->assertForbidden();
    }

    public function test_el_editor_cierra_la_recepcion_de_solicitudes_y_queda_en_la_bitacora(): void
    {
        $editor = $this->cuenta();

        $this->actingAs($editor)
            ->putJson('/api/innova/contenido', [
                'presentacion' => 'INNOVA es la Empresa Junior de la Carrera de Administración de Empresas.',
                'mision' => '',
                'vision' => null,
                'correo' => 'innova@uagrm.edu.bo',
                'recibe_solicitudes' => false,
            ])
            ->assertOk()
            ->assertJsonPath('contenido.recibe_solicitudes', false)
            ->assertJsonPath('contenido.mision', null);

        $this->assertDatabaseHas('bitacora', ['user_id' => $editor->id, 'recurso' => 'Empresa Junior INNOVA: presentación', 'detalle' => 'Cerró la recepción de solicitudes']);

        // Con la recepción cerrada, la solicitud se rechaza con un mensaje claro
        $this->postJson('/api/innova/solicitudes', $this->solicitud())
            ->assertUnprocessable()
            ->assertJsonPath('errors.descripcion.0', 'INNOVA no está recibiendo solicitudes por ahora. Vuelva a intentarlo más adelante.');
    }

    public function test_guarda_los_servicios_y_no_admite_nombres_repetidos(): void
    {
        $editor = $this->cuenta();

        $this->actingAs($editor)
            ->putJson('/api/innova/servicios', ['servicios' => [
                ['nombre' => 'Marketing digital', 'descripcion' => 'Redes sociales y presencia en internet.'],
                ['nombre' => 'Plan de negocios', 'descripcion' => 'Plan para emprendimientos.'],
            ]])
            ->assertOk()
            ->assertJsonCount(2, 'servicios')
            ->assertJsonPath('servicios.0.nombre', 'Marketing digital');

        $this->actingAs($editor)
            ->putJson('/api/innova/servicios', ['servicios' => [
                ['nombre' => 'Plan de negocios', 'descripcion' => 'Uno.'],
                ['nombre' => 'PLAN DE NEGOCIOS', 'descripcion' => 'Otro.'],
            ]])
            ->assertUnprocessable()
            ->assertJsonPath('errors', fn ($e) => $e['servicios.1.nombre'] === ['Ya hay otro servicio con ese nombre.']);
    }

    // ---------- CU-09 Enviar solicitud a INNOVA ----------

    public function test_un_visitante_envia_una_solicitud(): void
    {
        $this->postJson('/api/innova/solicitudes', $this->solicitud())
            ->assertCreated()
            ->assertJsonPath('mensaje', 'Recibimos su solicitud. El equipo de INNOVA la revisará y le escribirá a su correo.');

        $solicitud = SolicitudInnova::sole();
        $this->assertSame('pendiente', $solicitud->estado);
        $this->assertSame('Plan de negocios', $solicitud->servicio);
        $this->assertSame('Panadería El Trigal', $solicitud->organizacion);
        $this->assertSame('carlos.mendez@gmail.com', $solicitud->correo);
        $this->assertNull($solicitud->telefono);

        // Si después cambia la lista de servicios, la solicitud conserva lo que se pidió
        ServicioInnova::query()->delete();
        $this->assertSame('Plan de negocios', $solicitud->fresh()->servicio);
    }

    public function test_se_puede_pedir_otro_servicio_que_no_esta_en_la_lista(): void
    {
        $this->postJson('/api/innova/solicitudes', $this->solicitud(['servicio_id' => '']))->assertCreated();

        $this->assertNull(SolicitudInnova::sole()->servicio);
    }

    public function test_valida_la_solicitud_con_mensajes_en_espanol(): void
    {
        $this->postJson('/api/innova/solicitudes', $this->solicitud([
            'nombre' => '',
            'correo' => 'sin-arroba',
            'servicio_id' => 999,
            'descripcion' => 'Ayuda',
        ]))
            ->assertUnprocessable()
            ->assertJsonPath('errors.nombre.0', 'Escriba su nombre.')
            ->assertJsonPath('errors.correo.0', 'Escriba un correo electrónico válido, por ejemplo nombre@gmail.com.')
            ->assertJsonPath('errors.servicio_id.0', 'Ese servicio ya no está disponible. Elija otro de la lista.')
            ->assertJsonPath('errors.descripcion.0', 'Describa un poco más lo que necesita (al menos 20 caracteres).');
    }

    public function test_descarta_programas_automaticos_y_limita_envios_seguidos(): void
    {
        $this->postJson('/api/innova/solicitudes', $this->solicitud(['sitio_web' => 'spam']))->assertCreated();
        $this->assertDatabaseCount('innova_solicitudes', 0);

        for ($i = 0; $i < 4; $i++) {
            $this->postJson('/api/innova/solicitudes', $this->solicitud())->assertCreated();
        }

        $this->postJson('/api/innova/solicitudes', $this->solicitud())
            ->assertStatus(429)
            ->assertJsonPath('errors.descripcion.0', 'Ya envió varias solicitudes seguidas. Espere 10 minutos antes de enviar otra.');
    }

    // ---------- CU-23 Atender solicitudes de INNOVA ----------

    public function test_atender_solicitudes_exige_permiso(): void
    {
        $this->getJson('/api/gestion/innova/solicitudes')->assertUnauthorized();
        $this->actingAs($this->cuenta(Rol::EDITOR_COMUNICACION))->getJson('/api/gestion/innova/solicitudes')->assertForbidden();
    }

    public function test_el_personal_ve_las_solicitudes_y_cambia_su_estado(): void
    {
        $this->postJson('/api/innova/solicitudes', $this->solicitud())->assertCreated();
        $solicitud = SolicitudInnova::sole();
        $editor = $this->cuenta();

        $this->actingAs($editor)
            ->getJson('/api/gestion/innova/solicitudes')
            ->assertOk()
            ->assertJsonPath('data.0.estado', 'pendiente')
            ->assertJsonPath('data.0.servicio', 'Plan de negocios');

        $this->actingAs($editor)
            ->patchJson("/api/gestion/innova/solicitudes/{$solicitud->id}", [
                'estado' => 'aceptada',
                'respuesta' => 'Le escribimos el 12/11 para coordinar una reunión.',
            ])
            ->assertOk()
            ->assertJsonPath('data.estado', 'aceptada')
            ->assertJsonPath('data.atendida_por', $editor->name);

        $this->assertNotNull($solicitud->fresh()->atendida_en);
        $this->assertDatabaseHas('bitacora', [
            'user_id' => $editor->id,
            'accion' => 'atender',
            'recurso' => "SolicitudInnova #{$solicitud->id}",
            'detalle' => 'Pendiente -> Aceptada',
        ]);
    }

    public function test_rechazar_exige_el_motivo(): void
    {
        $this->postJson('/api/innova/solicitudes', $this->solicitud())->assertCreated();
        $solicitud = SolicitudInnova::sole();

        $this->actingAs($this->cuenta())
            ->patchJson("/api/gestion/innova/solicitudes/{$solicitud->id}", ['estado' => 'rechazada', 'respuesta' => ''])
            ->assertUnprocessable()
            ->assertJsonPath('errors.respuesta.0', 'Escriba el motivo del rechazo para poder comunicarlo.');

        $this->actingAs($this->cuenta())
            ->patchJson("/api/gestion/innova/solicitudes/{$solicitud->id}", ['estado' => 'archivada'])
            ->assertUnprocessable()
            ->assertJsonPath('errors.estado.0', 'Elija un estado de la lista.');

        $this->assertSame('pendiente', $solicitud->fresh()->estado);
        $this->assertTrue(Innova::recibeSolicitudes());
    }
}
