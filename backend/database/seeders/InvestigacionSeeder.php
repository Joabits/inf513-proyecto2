<?php

namespace Database\Seeders;

use App\Modulos\Investigacion\ContenidoInvestigacion;
use App\Modulos\Investigacion\Linea;
use App\Modulos\Investigacion\Semillero;
use Illuminate\Database\Seeder;

/**
 * Líneas de investigación, semilleros y PIA (CU-19), tomados del documento
 * «Solicitud de información y contenidos» que entregó la Carrera.
 * Los proyectos de investigación figuran como pendientes: los registra el personal.
 * Solo se carga lo que está vacío, para no borrar lo que edite el personal.
 */
class InvestigacionSeeder extends Seeder
{
    private const LINEAS = [
        ['Gestión Estratégica, Innovación y Prospectiva Organizacional', 'Estudia la planificación estratégica, la innovación y la capacidad de las organizaciones para anticiparse a los cambios del entorno. Busca fortalecer la competitividad y mejorar la toma de decisiones empresariales.'],
        ['Emprendimiento, Desarrollo Empresarial y Ecosistemas Productivos', 'Analiza la creación, el crecimiento y la sostenibilidad de empresas y emprendimientos. Promueve la innovación en los modelos de negocio y la articulación entre empresas, instituciones y academia.'],
        ['Gestión del Talento Humano, Cultura Organizacional y Liderazgo', 'Investiga la gestión del personal, el liderazgo y la cultura organizacional. Busca contribuir al desarrollo de las capacidades humanas, mejorar el clima laboral y fortalecer el desempeño de las organizaciones.'],
        ['Finanzas, Sostenibilidad y Creación de Valor', 'Aborda la gestión financiera, las inversiones, el financiamiento y la evaluación de riesgos. Promueve decisiones que contribuyan a la creación de valor económico y social, considerando la sostenibilidad de las organizaciones.'],
        ['Marketing, Inteligencia de Negocios y Comportamiento del Consumidor', 'Estudia las estrategias de marketing, las tendencias de consumo y el análisis de información comercial. Busca mejorar el posicionamiento de las empresas y orientar sus decisiones hacia las necesidades del mercado.'],
        ['Gestión Pública, Gobernanza y Responsabilidad Social Empresarial', 'Analiza la gestión de las instituciones públicas, la gobernanza y las prácticas de responsabilidad social empresarial. Promueve la transparencia, la ética y el compromiso de las organizaciones con el desarrollo sostenible.'],
        ['Transformación Digital y Gestión Basada en Datos', 'Investiga la incorporación de tecnologías digitales, la automatización y el uso de datos para la toma de decisiones. Busca mejorar los procesos, impulsar la innovación y fortalecer la competitividad organizacional.'],
        ['Educación, Formación Empresarial y Calidad Académica', 'Estudia los procesos de enseñanza y aprendizaje en el ámbito empresarial, la innovación educativa y la calidad de la formación profesional. Busca fortalecer las competencias de los futuros administradores y vincular la formación académica con las necesidades del entorno.'],
        ['Economía Social, Solidaria y Desarrollo Territorial', 'Analiza las formas de organización y gestión de cooperativas, asociaciones productivas y emprendimientos comunitarios. Promueve la inclusión económica, la generación de valor compartido y el desarrollo sostenible de los territorios.'],
        ['Gobernanza Universitaria y Gestión del Conocimiento', 'Estudia la gestión institucional universitaria, el aseguramiento de la calidad y los mecanismos de participación académica. Busca fortalecer la generación, transferencia y aplicación del conocimiento en beneficio de las organizaciones y la sociedad.'],
        ['Gestión de Producción y Operaciones', 'Estudia la planificación, organización y control de los procesos productivos y operativos de las organizaciones. Busca mejorar el uso de los recursos, la calidad de los productos y servicios, la productividad y la gestión de las cadenas de suministro.'],
    ];

    private const SEMILLEROS = [
        'Semillero de Administración y Gestión Estratégica',
        'Semillero de Marketing y Comercio',
        'Semillero de Finanzas y Gestión Financiera',
        'Semillero de Gestión del Talento Humano',
        'Semillero de Producción y Operaciones',
        'Semillero de Innovación y Emprendimiento',
    ];

    public function run(): void
    {
        if (! Linea::exists()) {
            foreach (self::LINEAS as $orden => [$nombre, $descripcion]) {
                Linea::create(compact('nombre', 'descripcion', 'orden'));
            }
        }

        if (! Semillero::exists()) {
            foreach (self::SEMILLEROS as $orden => $nombre) {
                Semillero::create(compact('nombre', 'orden'));
            }
        }

        if (! ContenidoInvestigacion::exists()) {
            ContenidoInvestigacion::create([
                'semilleros_presentacion' => 'Es un espacio académico donde estudiantes de la Carrera, con la orientación de docentes tutores, desarrollan habilidades de investigación mediante el trabajo colaborativo y la participación en proyectos científicos. Su propósito es fortalecer la formación investigativa, el pensamiento crítico y la generación de conocimiento aplicado, promoviendo soluciones a problemáticas empresariales y contribuyendo al desarrollo de la investigación y la producción científica de la Carrera.',
                'semilleros_mision' => 'Desarrollar competencias científicas en estudiantes de Administración de Empresas mediante la formación rigurosa en investigación y generación de conocimiento académico.',
                'semilleros_vision' => 'Consolidarse como un semillero académico destacado por la calidad metodológica y la producción científica en el área empresarial.',
                'semilleros_objetivos' => implode("\n", [
                    'Fomentar la cultura de investigación en estudiantes.',
                    'Integrar la investigación con el plan de estudios.',
                    'Desarrollar proyectos de investigación estudiantil.',
                    'Promover la participación en Congresos y Eventos Científicos.',
                    'Generar publicaciones académicas estudiantiles.',
                ]),
                'semilleros_coordinador' => 'Lic. Saúl E. Lozano Morales',
                'pia_presentacion' => 'Es una estrategia académica aplicada en las asignaturas de la Carrera de Administración de Empresas y orientada a integrar la investigación dentro del proceso de enseñanza – aprendizaje. El propósito es promover la generación de proyectos académicos desde las asignaturas, permitiendo que los estudiantes desarrollen soluciones frente a problemáticas reales del entorno organizacional y socioeconómico; además de generar informes, presentaciones, ponencias, pósteres y propuestas de mejora.',
                'instituto' => 'La FCEE cuenta con el Instituto de Investigaciones Económicas y Sociales José Ortiz Mercado (IIESJOM).',
            ]);
        }
    }
}
