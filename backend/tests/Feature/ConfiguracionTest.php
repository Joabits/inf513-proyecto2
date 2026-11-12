<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use Database\Seeders\ConfiguracionSeeder;
use Database\Seeders\PermisoSeeder;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConfiguracionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RolSeeder::class, PermisoSeeder::class, ConfiguracionSeeder::class]);
    }

    private function cuenta(string $rol = Rol::DIRECTOR): User
    {
        return User::factory()->create(['rol_id' => Rol::where('slug', $rol)->value('id')]);
    }

    private function contacto(array $cambios = []): array
    {
        return [
            'direccion' => 'Av. Busch, Ciudad Universitaria',
            'referencia' => 'Módulo 255, planta baja',
            'ciudad' => 'Santa Cruz de la Sierra, Bolivia',
            'telefono' => '+591 3 355-0000',
            'whatsapp' => '+591 700-00000',
            'correo' => 'administracion@uagrm.edu.bo',
            'horario' => 'Lunes a viernes de 8:00 a 12:00 y de 14:30 a 18:30',
            'mapa_url' => 'https://maps.app.goo.gl/ejemplo',
            ...$cambios,
        ];
    }

    public function test_cualquier_visitante_ve_los_datos_de_contacto_y_enlaces(): void
    {
        $this->getJson('/api/configuracion')
            ->assertOk()
            ->assertJsonPath('contacto.direccion', 'Av. Busch, Ciudad Universitaria')
            ->assertJsonPath('contacto.telefono', null)
            ->assertJsonPath('redes', [])
            ->assertJsonCount(4, 'enlaces')
            ->assertJsonPath('enlaces.0', ['titulo' => 'UAGRM', 'url' => 'https://www.uagrm.edu.bo']);

        // La pide el pie de cada página: no cuenta como recurso accedido
        $this->assertDatabaseMissing('bitacora', ['tipo' => 'acceso', 'recurso' => 'api/configuracion']);
    }

    public function test_editar_exige_sesion_y_permiso(): void
    {
        $this->putJson('/api/configuracion/contacto', $this->contacto())->assertUnauthorized();

        $this->actingAs($this->cuenta(Rol::EDITOR_INSTITUCIONAL))
            ->putJson('/api/configuracion/contacto', $this->contacto())
            ->assertForbidden();
    }

    public function test_actualiza_el_contacto_y_limpia_los_datos(): void
    {
        $director = $this->cuenta();

        $this->actingAs($director)
            ->putJson('/api/configuracion/contacto', $this->contacto(['referencia' => '   ', 'horario' => '']))
            ->assertOk()
            ->assertJsonPath('contacto.whatsapp', '59170000000')
            ->assertJsonPath('contacto.telefono', '+591 3 355-0000')
            ->assertJsonPath('contacto.referencia', null)
            ->assertJsonPath('contacto.horario', null);

        $this->assertDatabaseCount('configuracion_contacto', 1);
        $this->assertDatabaseHas('bitacora', ['user_id' => $director->id, 'accion' => 'editar', 'recurso' => 'Configuración: datos de contacto']);
    }

    public function test_valida_el_contacto_con_mensajes_en_espanol(): void
    {
        $this->actingAs($this->cuenta())
            ->putJson('/api/configuracion/contacto', $this->contacto([
                'direccion' => '',
                'telefono' => 'llamar al rato',
                'whatsapp' => '123',
                'correo' => 'no-es-correo',
                'mapa_url' => 'http://maps.google.com',
            ]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['direccion', 'correo'])
            ->assertJsonPath('errors.telefono.0', 'Escriba un teléfono válido: números, espacios, guiones, paréntesis y el signo +.')
            ->assertJsonPath('errors.whatsapp.0', 'Escriba el número de WhatsApp con el código de país, por ejemplo 591 70000000.')
            ->assertJsonPath('errors.mapa_url.0', 'El enlace del mapa debe ser una dirección web que empiece con https://.');
    }

    public function test_guarda_las_redes_en_orden_y_rechaza_enlaces_de_otra_red(): void
    {
        $director = $this->cuenta();

        $this->actingAs($director)
            ->putJson('/api/configuracion/redes', ['redes' => [
                ['red' => 'instagram', 'url' => 'https://www.instagram.com/admempresas.uagrm'],
                ['red' => 'facebook', 'url' => 'https://m.facebook.com/admempresas.uagrm'],
            ]])
            ->assertOk()
            ->assertJsonPath('redes.0.red', 'instagram')
            ->assertJsonPath('redes.1.red', 'facebook');

        $this->assertDatabaseHas('bitacora', ['user_id' => $director->id, 'recurso' => 'Configuración: redes sociales']);

        $this->actingAs($director)
            ->putJson('/api/configuracion/redes', ['redes' => [
                ['red' => 'facebook', 'url' => 'https://www.instagram.com/admempresas.uagrm'],
                ['red' => 'facebook', 'url' => 'https://facebook.com.sitio-falso.com/pagina'],
                ['red' => 'myspace', 'url' => 'https://myspace.com/x'],
            ]])
            ->assertUnprocessable()
            ->assertJsonPath('errors', fn ($errores) => $errores['redes.0.url'] === ['El enlace no es de Facebook.']
                && $errores['redes.1.red'] === ['Esa red ya está en la lista.']
                && $errores['redes.2.red'] === ['Elija una red de la lista.']);

        // Sin cambios: siguen las dos redes guardadas antes
        $this->getJson('/api/configuracion')->assertJsonCount(2, 'redes');
    }

    public function test_guarda_los_enlaces_y_solo_acepta_rutas_internas_o_https(): void
    {
        $this->actingAs($this->cuenta())
            ->putJson('/api/configuracion/enlaces', ['enlaces' => [
                ['titulo' => 'Documentos', 'url' => '/documentos'],
                ['titulo' => 'Calendario académico', 'url' => 'https://www.uagrm.edu.bo/calendario'],
            ]])
            ->assertOk()
            ->assertJsonCount(2, 'enlaces')
            ->assertJsonPath('enlaces.0.url', '/documentos');

        $this->actingAs($this->cuenta())
            ->putJson('/api/configuracion/enlaces', ['enlaces' => [
                ['titulo' => 'Inseguro', 'url' => 'http://www.uagrm.edu.bo'],
                ['titulo' => 'Otro sitio', 'url' => '//sitio-falso.com'],
                ['titulo' => 'Mal escrito', 'url' => 'https://uagrm edu bo'],
                ['titulo' => '', 'url' => '/'],
            ]])
            ->assertUnprocessable()
            ->assertJsonPath('errors', fn ($errores) => $errores['enlaces.0.url'] === ['El enlace debe empezar con / o con https://.']
                && $errores['enlaces.1.url'] === ['El enlace debe empezar con / o con https://.']
                && $errores['enlaces.2.url'] === ['El enlace no es una dirección web válida.']
                && isset($errores['enlaces.3.titulo']));
    }

    public function test_se_pueden_quitar_todas_las_redes_y_enlaces(): void
    {
        $this->actingAs($this->cuenta())->putJson('/api/configuracion/enlaces', ['enlaces' => []])->assertOk()->assertJsonPath('enlaces', []);
        $this->actingAs($this->cuenta())->putJson('/api/configuracion/redes', ['redes' => []])->assertOk()->assertJsonPath('redes', []);
    }
}
