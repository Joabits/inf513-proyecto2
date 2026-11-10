<?php

namespace Database\Seeders;

use App\Models\Rol;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Un usuario de prueba por rol. La contraseña NO está en el código:
 * se toma de SEMILLA_CLAVE en el .env de cada uno. Si está vacía, no se crean.
 */
class UsuarioPruebaSeeder extends Seeder
{
    public function run(): void
    {
        $clave = env('SEMILLA_CLAVE');

        if (blank($clave)) {
            $this->command?->warn('SEMILLA_CLAVE está vacía en .env: no se crearon usuarios de prueba.');

            return;
        }

        $usuarios = [
            [Rol::DIRECTOR, 'Director de Carrera (prueba)', 'director@cae.test'],
            [Rol::EDITOR_INSTITUCIONAL, 'Editor Institucional (prueba)', 'institucional@cae.test'],
            [Rol::EDITOR_COMUNICACION, 'Editor de Comunicación (prueba)', 'comunicacion@cae.test'],
            [Rol::USUARIO, 'Usuario (prueba)', 'usuario@cae.test'],
        ];

        foreach ($usuarios as [$slug, $nombre, $correo]) {
            User::updateOrCreate(['email' => $correo], [
                'name' => $nombre,
                'password' => $clave,
                'rol_id' => Rol::where('slug', $slug)->value('id'),
                'activo' => true,
            ]);
        }
    }
}
