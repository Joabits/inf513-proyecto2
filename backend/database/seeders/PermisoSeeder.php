<?php

namespace Database\Seeders;

use App\Models\Permiso;
use App\Models\Rol;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * MATRIZ DE ACCESO del portal: recursos x acciones x roles.
 * Para cambiar qué puede hacer un rol, se edita este archivo y se ejecuta:
 *   php artisan db:seed --class=PermisoSeeder
 */
class PermisoSeeder extends Seeder
{
    private const CRUD = ['ver', 'crear', 'editar', 'eliminar'];

    /** recurso => [descripción, acciones] */
    public const RECURSOS = [
        'inicio' => ['Página de inicio', ['ver', 'editar']],
        'institucional' => ['Información institucional', ['ver', 'editar']],
        'docentes' => ['Autoridades y docentes', self::CRUD],
        'info_academica' => ['Información académica', self::CRUD],
        'documentos' => ['Documentos', self::CRUD],
        'investigacion' => ['Investigación', self::CRUD],
        'revista' => ['Revista INNOVAR', self::CRUD],
        'vinculacion' => ['Convenios y vinculación', self::CRUD],
        'empresa_junior' => ['Empresa Junior INNOVA', ['ver', 'editar']],
        'solicitudes_innova' => ['Solicitudes a INNOVA', ['ver', 'editar']],
        'noticias' => ['Noticias', self::CRUD],
        'eventos' => ['Eventos académicos', self::CRUD],
        'galeria' => ['Galería multimedia', self::CRUD],
        'mensajes' => ['Mensajes de contacto', ['ver', 'editar', 'eliminar']],
        'usuarios' => ['Usuarios', self::CRUD],
        'graduados' => ['Graduados', ['ver', 'exportar']],
        'bitacora' => ['Bitácora', ['ver']],
        'estadisticas' => ['Estadísticas', ['ver']],
        'configuracion' => ['Datos de contacto y enlaces', ['ver', 'editar']],
        'mi_graduado' => ['Mis datos de graduado', ['ver', 'editar']],
    ];

    /** rol => recursos sobre los que tiene TODAS sus acciones ('*' = todos) */
    private const MATRIZ = [
        Rol::DIRECTOR => ['*'],
        Rol::EDITOR_INSTITUCIONAL => [
            'inicio', 'institucional', 'docentes', 'info_academica', 'documentos',
            'investigacion', 'revista', 'vinculacion', 'empresa_junior', 'solicitudes_innova',
        ],
        Rol::EDITOR_COMUNICACION => ['noticias', 'eventos', 'galeria', 'mensajes'],
        Rol::USUARIO => ['mi_graduado'],
    ];

    /** Recursos personales que el Director no necesita */
    private const SOLO_USUARIO = ['mi_graduado'];

    public function run(): void
    {
        DB::table('rol_permiso')->delete();

        foreach (self::RECURSOS as $recurso => [$descripcion, $acciones]) {
            foreach ($acciones as $accion) {
                Permiso::updateOrCreate(
                    ['slug' => "$recurso.$accion"],
                    ['recurso' => $recurso, 'accion' => $accion, 'descripcion' => ucfirst($accion).' · '.$descripcion],
                );
            }
        }

        foreach (self::MATRIZ as $slugRol => $recursos) {
            $permisos = Permiso::query()
                ->when($recursos === ['*'],
                    fn ($q) => $q->whereNotIn('recurso', self::SOLO_USUARIO),
                    fn ($q) => $q->whereIn('recurso', $recursos))
                ->pluck('id');

            Rol::where('slug', $slugRol)->firstOrFail()->permisos()->sync($permisos);
        }
    }
}
