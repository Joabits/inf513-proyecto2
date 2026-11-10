<?php

namespace Database\Seeders;

use App\Models\Permiso;
use App\Modulos\Menu\Menu;
use Illuminate\Database\Seeder;

/**
 * Menú dinámico. Las opciones de gestión se ligan al permiso "<recurso>.ver":
 * cada rol ve solo las opciones de los recursos que la matriz de acceso le permite ver.
 */
class MenuSeeder extends Seeder
{
    public function run(): void
    {
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

        // ---------- Menú de gestión: [título, ruta, recurso] ----------
        $gestion = [
            ['Contenido institucional', [
                ['Página de inicio', '/gestion/inicio', 'inicio'],
                ['Información institucional', '/gestion/institucional', 'institucional'],
                ['Autoridades y docentes', '/gestion/docentes', 'docentes'],
                ['Información académica', '/gestion/informacion-academica', 'info_academica'],
                ['Documentos', '/gestion/documentos', 'documentos'],
            ]],
            ['Investigación y vinculación', [
                ['Investigación', '/gestion/investigacion', 'investigacion'],
                ['Revista INNOVAR', '/gestion/revista-innovar', 'revista'],
                ['Convenios y vinculación', '/gestion/vinculacion', 'vinculacion'],
                ['Empresa Junior INNOVA', '/gestion/empresa-junior', 'empresa_junior'],
                ['Solicitudes a INNOVA', '/gestion/solicitudes-innova', 'solicitudes_innova'],
            ]],
            ['Comunicación', [
                ['Noticias', '/gestion/noticias', 'noticias'],
                ['Eventos académicos', '/gestion/eventos', 'eventos'],
                ['Galería multimedia', '/gestion/galeria', 'galeria'],
                ['Mensajes de contacto', '/gestion/mensajes', 'mensajes'],
            ]],
            ['Administración', [
                ['Estadísticas', '/gestion/estadisticas', 'estadisticas'],
                ['Usuarios', '/gestion/usuarios', 'usuarios'],
                ['Graduados', '/gestion/graduados', 'graduados'],
                ['Bitácora', '/gestion/bitacora', 'bitacora'],
                ['Datos de contacto y enlaces', '/gestion/configuracion', 'configuracion'],
            ]],
            ['Mi cuenta', [
                ['Mis datos de graduado', '/mi-cuenta/graduado', 'mi_graduado'],
            ]],
        ];

        foreach ($publico as $i => $item) {
            $padre = Menu::create(['titulo' => $item[0], 'ruta' => $item[1], 'seccion' => 'publico', 'orden' => $i]);
            foreach ($item[2] ?? [] as $j => [$titulo, $ruta]) {
                Menu::create(['parent_id' => $padre->id, 'titulo' => $titulo, 'ruta' => $ruta, 'seccion' => 'publico', 'orden' => $j]);
            }
        }

        $permisoVer = Permiso::where('accion', 'ver')->pluck('id', 'recurso');

        foreach ($gestion as $i => [$tituloGrupo, $hijos]) {
            $grupo = Menu::create(['titulo' => $tituloGrupo, 'seccion' => 'gestion', 'orden' => $i]);
            foreach ($hijos as $j => [$titulo, $ruta, $recurso]) {
                Menu::create([
                    'parent_id' => $grupo->id,
                    'permiso_id' => $permisoVer[$recurso],
                    'titulo' => $titulo,
                    'ruta' => $ruta,
                    'seccion' => 'gestion',
                    'orden' => $j,
                ]);
            }
        }
    }
}
