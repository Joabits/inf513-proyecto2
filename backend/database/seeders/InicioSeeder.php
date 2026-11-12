<?php

namespace Database\Seeders;

use App\Modulos\Inicio\Acceso;
use App\Modulos\Inicio\Cifra;
use App\Modulos\Inicio\Portada;
use Illuminate\Database\Seeder;

/**
 * Contenido inicial de la portada, tomado de la información que entregó la Carrera.
 * Solo se carga si la portada está vacía, para no borrar lo que edite el personal.
 */
class InicioSeeder extends Seeder
{
    public function run(): void
    {
        if (Portada::exists()) {
            return;
        }

        Portada::create([
            'distintivo' => 'Carrera acreditada ante el CEUB',
            'titulo' => 'Administración de Empresas',
            'presentacion' => 'Bienvenidos a la Carrera de Administración de Empresas de la Facultad de Ciencias Económicas y Empresariales (FCEE) de la Universidad Autónoma Gabriel René Moreno. Formamos profesionales capacitados para gerenciar y liderar organizaciones de todo tipo, con visión estratégica, innovación y compromiso con el desarrollo empresarial.',
            'director_nombre' => 'Lic. Freddy Fuentes Soliz',
            'director_cargo' => 'Director de Carrera',
            'director_mensaje' => 'Nos enorgullece destacar que nuestra Carrera está Acreditada ante el CEUB, respaldo que garantiza estándares de calidad, pertinencia y un proceso formativo sólido orientado a formar profesionales para gerenciar y liderar organizaciones de todo tipo, con visión estratégica e innovación. Aquí encontrarán la oferta formativa, noticias, actividades, servicios y logros que reflejan nuestro compromiso con la excelencia.',
        ]);

        $cifras = [
            ['1970', 'Año de fundación'],
            ['10', 'Semestres'],
            ['47', 'Materias'],
            ['11', 'Líneas de investigación'],
        ];

        foreach ($cifras as $orden => [$valor, $etiqueta]) {
            Cifra::create(compact('valor', 'etiqueta', 'orden'));
        }

        $accesos = [
            ['Malla curricular', 'Plan 101-4 y prerrequisitos de cada materia.', '/malla-curricular'],
            ['Investigación', 'Líneas de investigación, PIA y semilleros.', '/investigacion'],
            ['Revista INNOVAR', 'Revista académica de la Carrera.', '/revista-innovar'],
            ['Noticias y eventos', 'Actividades, comunicados y agenda.', '/noticias'],
        ];

        foreach ($accesos as $orden => [$titulo, $descripcion, $ruta]) {
            Acceso::create(compact('titulo', 'descripcion', 'ruta', 'orden'));
        }
    }
}
