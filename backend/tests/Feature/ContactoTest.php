<?php

namespace Tests\Feature;

use App\Modulos\Contacto\MensajeContacto;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContactoTest extends TestCase
{
    use RefreshDatabase;

    private function mensaje(array $cambios = []): array
    {
        return [
            'nombre' => '  María   Fernanda Rojas ',
            'correo' => 'MFernanda.Rojas@Gmail.com',
            'telefono' => '',
            'asunto' => 'Requisitos de titulación',
            'mensaje' => 'Quisiera saber qué requisitos necesito para la modalidad de Trabajo Dirigido.',
            ...$cambios,
        ];
    }

    public function test_un_visitante_envia_un_mensaje_sin_iniciar_sesion(): void
    {
        $this->postJson('/api/contacto', $this->mensaje(), ['User-Agent' => 'Navegador de prueba'])
            ->assertCreated()
            ->assertJsonPath('mensaje', 'Gracias por escribirnos. Le responderemos a su correo lo antes posible.');

        $mensaje = MensajeContacto::sole();
        $this->assertSame('María Fernanda Rojas', $mensaje->nombre);
        $this->assertSame('mfernanda.rojas@gmail.com', $mensaje->correo);
        $this->assertNull($mensaje->telefono);
        $this->assertSame('nuevo', $mensaje->estado);
        $this->assertSame('127.0.0.1', $mensaje->ip);
        $this->assertSame('Navegador de prueba', $mensaje->navegador);
    }

    public function test_valida_el_formulario_con_mensajes_en_espanol(): void
    {
        $this->postJson('/api/contacto', $this->mensaje([
            'nombre' => '',
            'correo' => 'correo-sin-arroba',
            'telefono' => 'mi celular',
            'asunto' => '',
            'mensaje' => 'Hola',
        ]))
            ->assertUnprocessable()
            ->assertJsonPath('errors.nombre.0', 'Escriba su nombre.')
            ->assertJsonPath('errors.correo.0', 'Escriba un correo electrónico válido, por ejemplo nombre@gmail.com.')
            ->assertJsonPath('errors.telefono.0', 'Escriba un teléfono válido: números, espacios, guiones, paréntesis y el signo +.')
            ->assertJsonPath('errors.asunto.0', 'Escriba el asunto de su mensaje.')
            ->assertJsonPath('errors.mensaje.0', 'Cuéntenos un poco más: el mensaje debe tener al menos 10 caracteres.');

        $this->assertDatabaseCount('mensajes_contacto', 0);
    }

    public function test_descarta_en_silencio_lo_que_envia_un_programa_automatico(): void
    {
        $this->postJson('/api/contacto', $this->mensaje(['sitio_web' => 'https://spam.example']))->assertCreated();

        $this->assertDatabaseCount('mensajes_contacto', 0);
    }

    public function test_limita_los_envios_seguidos_desde_una_misma_conexion(): void
    {
        for ($i = 1; $i <= 5; $i++) {
            $this->postJson('/api/contacto', $this->mensaje(['asunto' => "Consulta $i"]))->assertCreated();
        }

        $this->postJson('/api/contacto', $this->mensaje())
            ->assertStatus(429)
            ->assertJsonPath('errors.mensaje.0', 'Ya envió varios mensajes seguidos. Espere 10 minutos antes de enviar otro.');

        $this->assertDatabaseCount('mensajes_contacto', 5);
    }
}
