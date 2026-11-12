<?php

namespace Database\Seeders;

use App\Modulos\Configuracion\DatosContacto;
use App\Modulos\Configuracion\EnlaceInteres;
use Illuminate\Database\Seeder;

/**
 * Datos de contacto y enlaces iniciales (CU-28). La Carrera todavía no entregó teléfonos,
 * correo ni redes oficiales: quedan vacíos para que el personal los complete en el panel.
 * Solo se carga si está vacío, para no borrar lo que edite el personal.
 */
class ConfiguracionSeeder extends Seeder
{
    public function run(): void
    {
        if (! DatosContacto::exists()) {
            DatosContacto::create([
                'direccion' => 'Av. Busch, Ciudad Universitaria',
                'referencia' => 'Módulo 255',
                'ciudad' => 'Santa Cruz de la Sierra, Bolivia',
            ]);
        }

        if (! EnlaceInteres::exists()) {
            $enlaces = [
                ['UAGRM', 'https://www.uagrm.edu.bo'],
                ['Facultad (FCEE)', 'https://www.uagrm.edu.bo/facultades/fcee'],
                ['Inscripciones', 'https://inscripcion.uagrm.edu.bo/'],
                ['Bibliotecas', 'https://bibliotecas.uagrm.edu.bo'],
            ];

            foreach ($enlaces as $orden => [$titulo, $url]) {
                EnlaceInteres::create(compact('titulo', 'url', 'orden'));
            }
        }
    }
}
