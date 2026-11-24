<?php

namespace Tests\Feature;

use App\Modulos\Docentes\Persona;
use App\Modulos\Revista\Articulo;
use App\Modulos\Revista\Edicion;
use App\Modulos\Revista\Revista;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** CU-07: el buscador encuentra al personal visible y a la revista INNOVAR publicada, y nada de lo oculto. */
class BusquedaPersonalRevistaTest extends TestCase
{
    use RefreshDatabase;

    private function buscar(string $q, ?string $tipo = null)
    {
        return $this->getJson('/api/buscar?'.http_build_query(array_filter(['q' => $q, 'tipo' => $tipo])));
    }

    private function grupo($respuesta, string $tipo): ?array
    {
        return collect($respuesta->json('grupos'))->firstWhere('tipo', $tipo);
    }

    private function edicion(int $numero, bool $publicada, string $titulo, array $datos = []): Edicion
    {
        // Las ediciones cuelgan de la presentación de la revista
        Revista::firstOrCreate([], ['presentacion' => 'Revista INNOVAR', 'colaboradores' => 'Normas para colaboradores']);

        return Edicion::create(['numero' => $numero, 'anio' => 2026, 'titulo' => $titulo, 'publicada' => $publicada, ...$datos]);
    }

    public function test_encuentra_al_personal_visible_por_nombre_o_cargo_y_no_al_oculto(): void
    {
        Persona::create(['nombre' => 'Lic. Ana Quispe', 'cargo' => 'Directora de Carrera', 'grupo' => 'autoridad', 'visible' => true]);
        Persona::create(['nombre' => 'Dr. Oculto Quispe', 'cargo' => 'Rector', 'grupo' => 'autoridad', 'visible' => false]);
        Persona::create(['nombre' => 'Ing. Luis Rojas', 'cargo' => 'Docente de Finanzas', 'grupo' => 'docente', 'visible' => true]);

        $porNombre = $this->grupo($this->buscar('quispe')->assertOk(), 'persona');
        $this->assertSame(1, $porNombre['total'], 'la persona oculta no aparece');
        $this->assertSame('Lic. Ana Quispe', $porNombre['resultados'][0]['titulo']);
        $this->assertSame('Autoridades', $porNombre['resultados'][0]['meta']);
        $this->assertSame('/docentes#titulo-autoridad', $porNombre['resultados'][0]['ruta']);

        $porCargo = $this->grupo($this->buscar('finanzas'), 'persona');
        $this->assertSame('Ing. Luis Rojas', $porCargo['resultados'][0]['titulo'], 'también se encuentra por el cargo, sin importar mayúsculas');
        $this->assertSame('Autoridades y docentes', $porCargo['etiqueta']);
    }

    public function test_encuentra_ediciones_publicadas_y_no_los_borradores(): void
    {
        $publicada = $this->edicion(1, true, 'Gestión e innovación', ['descripcion' => 'Edición dedicada al emprendimiento regional.']);
        $this->edicion(2, false, 'Emprendimiento en borrador');

        $grupo = $this->grupo($this->buscar('emprendimiento')->assertOk(), 'edicion');

        $this->assertSame(1, $grupo['total'], 'la edición sin publicar no aparece');
        $this->assertSame('Gestión e innovación', $grupo['resultados'][0]['titulo']);
        $this->assertSame("/revista-innovar#edicion-{$publicada->id}", $grupo['resultados'][0]['ruta']);
        $this->assertStringContainsString('Número 1', $grupo['resultados'][0]['meta']);
    }

    public function test_encuentra_articulos_por_titulo_o_autor_solo_de_ediciones_publicadas(): void
    {
        $publicada = $this->edicion(1, true, 'Primera');
        $borrador = $this->edicion(2, false, 'Segunda');
        $conPdf = Articulo::create(['edicion_id' => $publicada->id, 'titulo' => 'Liderazgo en pymes', 'autores' => 'María Céspedes', 'archivo' => 'revista/articulos/x.pdf']);
        Articulo::create(['edicion_id' => $publicada->id, 'titulo' => 'Clima laboral', 'autores' => 'María Céspedes']);
        Articulo::create(['edicion_id' => $borrador->id, 'titulo' => 'Liderazgo oculto', 'autores' => 'Otra Persona']);

        $porTitulo = $this->grupo($this->buscar('liderazgo')->assertOk(), 'articulo');
        $this->assertSame(1, $porTitulo['total'], 'el artículo de una edición sin publicar no aparece');
        $this->assertSame("/api/revista/articulos/{$conPdf->id}/archivo", $porTitulo['resultados'][0]['ruta'], 'con PDF, abre el archivo');
        $this->assertTrue($porTitulo['resultados'][0]['externo']);

        $porAutor = $this->grupo($this->buscar('cespedes'), 'articulo');
        $this->assertSame(2, $porAutor['total'], 'se encuentra por autor, sin tildes');
        $sinPdf = collect($porAutor['resultados'])->firstWhere('titulo', 'Clima laboral');
        $this->assertSame("/revista-innovar#edicion-{$publicada->id}", $sinPdf['ruta'], 'sin PDF, lleva a su edición');
        $this->assertFalse($sinPdf['externo']);
    }
}
