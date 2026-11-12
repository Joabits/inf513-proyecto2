<?php

namespace Database\Seeders;

use App\Modulos\Docentes\Persona;
use Illuminate\Database\Seeder;

/**
 * Autoridades y personal administrativo (CU-24), tomados del documento
 * «Solicitud de información y contenidos» que entregó la Carrera. Las fotografías y el
 * personal docente figuran como pendientes: los agrega el personal desde el panel.
 * Solo se carga si la tabla está vacía, para no borrar lo que edite el personal.
 */
class PersonalCarreraSeeder extends Seeder
{
    public function run(): void
    {
        if (Persona::exists()) {
            return;
        }

        $personas = [
            'autoridad' => [
                ['Dr. Reinerio Vargas Banegas', 'Rector U.A.G.R.M.'],
                ['Ing. Juana Borja Saavedra', 'Vicerrectora U.A.G.R.M.'],
                ['Lic. Ricardo Terrazas Soto', 'Decano F.C.E.E.'],
                ['Ing. Carlos Martínez Bonilla', 'Vicedecano F.C.E.E.'],
                ['Lic. Freddy Fuentes Soliz', 'Director de Carrera'],
            ],
            'administrativo' => [
                ['Lic. Higor Encinas Sibaute', 'Encargado de Seguimiento Curricular'],
                ['Lic. Olivia Vargas Sánchez', 'Encargada de Gestión Administrativa'],
                ['Lic. Madaí Galarza Ortega', 'Encargada de Graduación'],
                ['Dr. Deivit Castro Aguilera', 'Encargado de Investigación y Extensión'],
                ['Tec. Sup. Jenny Padilla Rivero', 'Secretaria de Dirección'],
            ],
        ];

        foreach ($personas as $grupo => $lista) {
            foreach ($lista as $orden => [$nombre, $cargo]) {
                Persona::create(compact('nombre', 'cargo', 'grupo', 'orden'));
            }
        }
    }
}
