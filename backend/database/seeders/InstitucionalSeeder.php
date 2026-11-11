<?php

namespace Database\Seeders;

use App\Modulos\Institucional\Hito;
use App\Modulos\Institucional\Institucional;
use Illuminate\Database\Seeder;

/**
 * Textos de «La Carrera» (CU-27), tomados del documento «Solicitud de información y contenidos»
 * que entregó la Carrera. Solo se cargan si la tabla está vacía, para no borrar lo que edite el personal.
 */
class InstitucionalSeeder extends Seeder
{
    public function run(): void
    {
        if (! Institucional::exists()) {
            Institucional::create([
                'presentacion' => 'La Carrera forma profesionales para gerenciar y liderar organizaciones, con visión estratégica, innovación y compromiso con el desarrollo empresarial. Destaca por su liderazgo, gestión empresarial, orientación práctica y toma de decisiones.',
                'resena_historica' => implode("\n\n", [
                    'La Carrera de Administración de Empresas de la Facultad de Ciencias Económicas y Empresariales (FCEE) de la UAGRM fue fundada el 15 de mayo de 1970, año desde el cual se proyecta como una respuesta académica a las demandas de la sociedad cruceña y boliviana; posteriormente, su trayectoria institucional fue reconocida mediante la Resolución I.C.U. N.º 051/2006, consolidando su presencia y desarrollo dentro de la estructura universitaria.',
                    'A lo largo de su trayectoria, actualizó su plan de estudios en distintas etapas, consolidando el Plan 101-4. Asimismo, impulsó procesos de autoevaluación y mejora continua que fortalecieron la calidad de su formación académica y gestión institucional.',
                    'Entre sus principales hitos destacan la primera acreditación nacional ante el Comité Ejecutivo de la Universidad Boliviana (CEUB) en 2012 y la obtención de una segunda acreditación nacional en octubre de 2024. También sobresalen sus iniciativas de interacción social, mediante las cuales brindó capacitación en gestión empresarial a emprendedores y organizaciones productivas, reafirmando su compromiso con el desarrollo de la región.',
                ]),
                'mision' => 'Formar profesionales en Administración de Empresas y líderes emprendedores con un enfoque integral en gestión, innovación y trabajo en equipo para la toma de decisiones estratégicas en beneficio de la sociedad.',
                'vision' => 'Ser reconocida como carrera líder en la formación de profesionales en Administración de Empresas, con orientación emprendedora que contribuyan al desarrollo sostenible de la sociedad.',
                'perfil_profesional' => 'El Licenciado en Administración de Empresas de la U.A.G.R.M. es un profesional comprometido con el desarrollo de la sociedad, la ciencia y el logro de los objetivos organizacionales en condiciones de calidad, para lo cual posee las competencias de planificación, organización, dirección y control, reflejadas mediante el ejercicio del liderazgo permanente, el trabajo en equipo, la toma de decisiones en condiciones de incertidumbre y el emprendimiento con responsabilidad social empresarial.',
                'campo_ocupacional' => implode("\n\n", [
                    'El Licenciado en Administración de Empresas es un profesional que puede desempeñarse en áreas ocupacionales de Alta Gerencia, Finanzas, Recursos Humanos, Producción y Operaciones, Marketing, Gestión de Calidad, Investigación y Desarrollo; y en cualquier área que tenga la organización.',
                    'Podrá desenvolverse en áreas específicas de Organizaciones Privadas, Organizaciones Públicas y Organizaciones Mixtas. También podrá desempeñarse como gestor de empresas grandes y pequeñas, nacionales o transnacionales, con o sin fines de lucro, tanto de manufacturas, de comercio, como de servicios, desarrollando actividades de dirección o asesoría, tanto a nivel de departamentos como de la organización en su globalidad. Además de la formación y desarrollo de empresas nuevas, propias, y el ejercicio profesional independiente.',
                ]),
                'fecha_creacion' => '1970-05-15',
                'resolucion' => 'Resolución I.C.U. N.º 051/2006',
                'acreditacion' => 'Acreditada ante el CEUB',
            ]);
        }

        if (! Hito::exists()) {
            $hitos = [
                [1970, 'Fundación de la Carrera', 'El 15 de mayo, como respuesta académica a las demandas de la sociedad cruceña y boliviana.'],
                [2006, 'Reconocimiento institucional', 'Su trayectoria es reconocida mediante la Resolución I.C.U. N.º 051/2006.'],
                [2012, 'Primera acreditación nacional', 'Ante el Comité Ejecutivo de la Universidad Boliviana (CEUB).'],
                [2024, 'Segunda acreditación nacional', 'En octubre, nuevamente ante el CEUB.'],
            ];

            foreach ($hitos as $orden => [$anio, $titulo, $descripcion]) {
                Hito::create(compact('anio', 'titulo', 'descripcion', 'orden'));
            }
        }
    }
}
