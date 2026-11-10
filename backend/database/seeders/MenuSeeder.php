<?php

namespace Database\Seeders;

use App\Models\Rol;
use App\Modulos\Menu\Menu;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Menú dinámico y matriz de acceso (rol_menu).
 * Para cambiar qué rol ve qué opción, se edita este archivo y se vuelve a correr:
 *   php artisan db:seed --class=MenuSeeder
 */
class MenuSeeder extends Seeder
{
    private const D = Rol::DIRECTOR;
    private const EI = Rol::EDITOR_INSTITUCIONAL;
    private const EC = Rol::EDITOR_COMUNICACION;
    private const U = Rol::USUARIO;

    public function run(): void
    {
        DB::table('rol_menu')->delete();
        Menu::query()->delete();

        // ---------- Menú público (lo ve cualquier visitante) ----------
        $publico = [
            ['Inicio', '/'],
            ['La Carrera', null, [
                ['Información institucional', '/carrera'],
                ['Autoridades y docentes', '/docentes'],
            ]],
            ['Oferta académica', null, [
                ['Malla curricular', '/malla-curricular'],
                ['Información académica', '/informacion-academica'],
                ['Documentos', '/documentos'],
            ]],
            ['Investigación', null, [
                ['Líneas y proyectos', '/investigacion'],
                ['Revista INNOVAR', '/revista-innovar'],
            ]],
            ['Vinculación', null, [
                ['Convenios y vinculación', '/vinculacion'],
                ['Empresa Junior INNOVA', '/empresa-junior'],
                ['Graduados (Alumni)', '/alumni'],
            ]],
            ['Noticias y eventos', null, [
                ['Noticias', '/noticias'],
                ['Eventos académicos', '/eventos'],
                ['Galería multimedia', '/galeria'],
            ]],
            ['Contacto', '/contacto'],
        ];

        // ---------- Menú de gestión: [título, ruta, roles] ----------
        $gestion = [
            ['Contenido institucional', null, [
                ['Página de inicio', '/gestion/inicio', [self::D, self::EI]],
                ['Información institucional', '/gestion/institucional', [self::D, self::EI]],
                ['Autoridades y docentes', '/gestion/docentes', [self::D, self::EI]],
                ['Información académica', '/gestion/informacion-academica', [self::D, self::EI]],
                ['Documentos', '/gestion/documentos', [self::D, self::EI]],
            ]],
            ['Investigación y vinculación', null, [
                ['Investigación', '/gestion/investigacion', [self::D, self::EI]],
                ['Revista INNOVAR', '/gestion/revista-innovar', [self::D, self::EI]],
                ['Convenios y vinculación', '/gestion/vinculacion', [self::D, self::EI]],
                ['Empresa Junior INNOVA', '/gestion/empresa-junior', [self::D, self::EI]],
                ['Solicitudes a INNOVA', '/gestion/solicitudes-innova', [self::D, self::EI]],
            ]],
            ['Comunicación', null, [
                ['Noticias', '/gestion/noticias', [self::D, self::EC]],
                ['Eventos académicos', '/gestion/eventos', [self::D, self::EC]],
                ['Galería multimedia', '/gestion/galeria', [self::D, self::EC]],
                ['Mensajes de contacto', '/gestion/mensajes', [self::D, self::EC]],
            ]],
            ['Administración', null, [
                ['Usuarios', '/gestion/usuarios', [self::D]],
                ['Graduados', '/gestion/graduados', [self::D]],
                ['Bitácora', '/gestion/bitacora', [self::D]],
                ['Estadísticas', '/gestion/estadisticas', [self::D]],
                ['Datos de contacto y enlaces', '/gestion/configuracion', [self::D]],
            ]],
            ['Mi cuenta', null, [
                ['Mis datos de graduado', '/mi-cuenta/graduado', [self::U]],
            ]],
        ];

        $idsRol = DB::table('roles')->pluck('id', 'slug');

        foreach ($publico as $i => $item) {
            $padre = Menu::create(['titulo' => $item[0], 'ruta' => $item[1], 'seccion' => 'publico', 'orden' => $i]);
            foreach ($item[2] ?? [] as $j => [$titulo, $ruta]) {
                Menu::create(['parent_id' => $padre->id, 'titulo' => $titulo, 'ruta' => $ruta, 'seccion' => 'publico', 'orden' => $j]);
            }
        }

        foreach ($gestion as $i => [$tituloGrupo, $rutaGrupo, $hijos]) {
            $grupo = Menu::create(['titulo' => $tituloGrupo, 'ruta' => $rutaGrupo, 'seccion' => 'gestion', 'orden' => $i]);
            foreach ($hijos as $j => [$titulo, $ruta, $roles]) {
                $opcion = Menu::create(['parent_id' => $grupo->id, 'titulo' => $titulo, 'ruta' => $ruta, 'seccion' => 'gestion', 'orden' => $j]);
                $opcion->roles()->attach($idsRol->only($roles)->values());
            }
        }
    }
}
