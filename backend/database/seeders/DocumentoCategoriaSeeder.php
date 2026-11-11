<?php

namespace Database\Seeders;

use App\Modulos\Documentos\Categoria;
use Illuminate\Database\Seeder;

/**
 * Categorías iniciales de documentos (propuesta por confirmar con la Carrera).
 * Solo se cargan si no hay ninguna; después las amplía el personal desde el panel.
 */
class DocumentoCategoriaSeeder extends Seeder
{
    public function run(): void
    {
        if (Categoria::exists()) {
            return;
        }

        foreach (['Reglamentos', 'Resoluciones', 'Formularios', 'Calendarios académicos', 'Guías e instructivos', 'Informes'] as $nombre) {
            Categoria::create(['nombre' => $nombre]);
        }
    }
}
