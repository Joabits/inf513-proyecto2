<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use App\Modulos\InformacionAcademica\Model;
use Database\Seeders\PermisoSeeder;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InformacionAcademicaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RolSeeder::class, PermisoSeeder::class]);
    }

    private function cuenta(string $rol = Rol::EDITOR_INSTITUCIONAL): User
    {
        return User::factory()->create(['rol_id' => Rol::where('slug', $rol)->value('id')]);
    }

    public function test_visitante_ve_la_informacion(): void
    {
        $editor = $this->cuenta();
        Model::create([
            'mision' => 'Misión de prueba',
            'vision' => 'Visión de prueba',
            'perfil_profesional' => 'Perfil de prueba',
            'objetivos' => 'Objetivos de prueba',
            'user_id' => $editor->id,
        ]);

        $this->getJson('/api/informacion-academica')
            ->assertOk()
            ->assertJsonPath('data.mision', 'Misión de prueba')
            ->assertJsonPath('data.vision', 'Visión de prueba')
            ->assertJsonPath('data.perfil_profesional', 'Perfil de prueba')
            ->assertJsonPath('data.objetivos', 'Objetivos de prueba');
    }

    public function test_sin_sesion_no_puede_editar(): void
    {
        $this->putJson('/api/informacion-academica', [
            'mision' => 'Misión no autorizada',
            'vision' => 'Visión no autorizada',
            'perfil_profesional' => 'Perfil no autorizado',
            'objetivos' => 'Objetivos no autorizados',
        ])->assertUnauthorized();
    }

    public function test_editor_edita_y_se_actualiza_en_bd(): void
    {
        $editor = $this->cuenta();

        $datos = [
            'mision' => 'Formar profesionales de excelencia académica.',
            'vision' => 'Ser la carrera referente en innovación y liderazgo.',
            'perfil_profesional' => 'Profesional integral con pensamiento crítico.',
            'objetivos' => 'Promover la investigación y la vinculación empresarial.',
        ];

        $this->actingAs($editor)
            ->putJson('/api/informacion-academica', $datos)
            ->assertOk()
            ->assertJsonPath('data.mision', $datos['mision'])
            ->assertJsonPath('data.vision', $datos['vision'])
            ->assertJsonPath('data.perfil_profesional', $datos['perfil_profesional'])
            ->assertJsonPath('data.objetivos', $datos['objetivos']);

        $this->assertDatabaseHas('informacion_academica', [
            'mision' => $datos['mision'],
            'vision' => $datos['vision'],
            'perfil_profesional' => $datos['perfil_profesional'],
            'objetivos' => $datos['objetivos'],
            'user_id' => $editor->id,
        ]);
    }
}
