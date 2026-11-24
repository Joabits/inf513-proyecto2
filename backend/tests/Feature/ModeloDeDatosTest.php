<?php

namespace Tests\Feature;

use App\Models\User;
use App\Modulos\Institucional\Hito;
use App\Modulos\Institucional\Institucional;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

/** El modelo de datos no tiene tablas sueltas: cada una se relaciona con al menos otra. */
class ModeloDeDatosTest extends TestCase
{
    use RefreshDatabase;

    /** Tablas internas de Laravel que no forman parte del modelo del portal. */
    private const INTERNAS = ['migrations'];

    public function test_ninguna_tabla_queda_suelta(): void
    {
        $tablas = collect(Schema::getTableListing(schemaQualified: false))
            ->reject(fn (string $t) => in_array($t, self::INTERNAS, true) || str_starts_with($t, 'sqlite_'));

        $relacionadas = $tablas->flatMap(fn (string $t) => collect(Schema::getForeignKeys($t))
            ->flatMap(fn (array $fk) => [$t, $fk['foreign_table']]))->unique();

        $this->assertSame([], $tablas->diff($relacionadas)->values()->all(), 'Tablas sin ninguna relación');
        $this->assertNotContains('password_reset_tokens', $tablas->all());
    }

    public function test_los_elementos_de_una_lista_se_enlazan_al_contenido_de_su_seccion(): void
    {
        $contenido = Institucional::create([
            'presentacion' => 'P', 'resena_historica' => 'R', 'mision' => 'M', 'vision' => 'V',
            'perfil_profesional' => 'PP', 'campo_ocupacional' => 'CO',
        ]);

        $hito = Hito::create(['anio' => 1970, 'titulo' => 'Creación de la Carrera', 'orden' => 0]);

        $this->assertSame($contenido->id, $hito->institucional_id);
        $this->assertTrue($contenido->hitos->contains($hito));
    }

    public function test_sin_el_contenido_de_la_seccion_no_se_crean_sus_elementos(): void
    {
        $this->expectException(ValidationException::class);

        Hito::create(['anio' => 1970, 'titulo' => 'Creación de la Carrera', 'orden' => 0]);
    }

    public function test_al_eliminar_una_cuenta_se_cierran_sus_sesiones(): void
    {
        $usuario = User::factory()->create();
        DB::table('sessions')->insert([
            'id' => 'sesion-de-prueba', 'user_id' => $usuario->id, 'payload' => '', 'last_activity' => time(),
        ]);

        $usuario->delete();

        $this->assertFalse(DB::table('sessions')->where('id', 'sesion-de-prueba')->exists());
    }
}
