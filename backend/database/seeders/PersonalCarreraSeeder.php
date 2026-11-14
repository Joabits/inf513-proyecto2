<?php

namespace Database\Seeders;

use App\Modulos\Docentes\Persona;
use Illuminate\Database\Seeder;

/**
 * Autoridades y personal administrativo (CU-24), tomados del documento
 * «Solicitud de información y contenidos» que entregó la Carrera. Las fotografías y el
 * personal docente figuran como pendientes: los agrega el personal desde el panel.
 *
 * El Rector y la Vicerrectora quedan ocultos: no pertenecen a la Carrera, cambian con cada
 * elección universitaria y el portal debe mostrar a quienes la dirigen. Siguen guardados
 * y se publican con un clic desde el panel si la Carrera lo decide.
 *
 * Solo se carga si la tabla está vacía, para no borrar lo que edite el personal.
 */
class PersonalCarreraSeeder extends Seeder
{
    public function run(): void
    {
        if (Persona::exists()) {
            return;
        }

        // [nombre, cargo, visible, destacado]
        $personas = [
            'autoridad' => [
                ['Dr. Reinerio Vargas Banegas', 'Rector U.A.G.R.M.', false, false],
                ['Ing. Juana Borja Saavedra', 'Vicerrectora U.A.G.R.M.', false, false],
                ['Lic. Ricardo Terrazas Soto', 'Decano F.C.E.E.', true, false],
                ['Ing. Carlos Martínez Bonilla', 'Vicedecano F.C.E.E.', true, false],
                ['Lic. Freddy Fuentes Soliz', 'Director de Carrera', true, true],
            ],
            'administrativo' => [
                ['Lic. Higor Encinas Sibaute', 'Encargado de Seguimiento Curricular', true, false],
                ['Lic. Olivia Vargas Sánchez', 'Encargada de Gestión Administrativa', true, false],
                ['Lic. Madaí Galarza Ortega', 'Encargada de Graduación', true, false],
                ['Dr. Deivit Castro Aguilera', 'Encargado de Investigación y Extensión', true, false],
                ['Tec. Sup. Jenny Padilla Rivero', 'Secretaria de Dirección', true, false],
            ],
        ];

        foreach ($personas as $grupo => $lista) {
            foreach ($lista as $orden => [$nombre, $cargo, $visible, $destacado]) {
                Persona::create(compact('nombre', 'cargo', 'grupo', 'orden', 'visible', 'destacado'));
            }
        }
    }
}
