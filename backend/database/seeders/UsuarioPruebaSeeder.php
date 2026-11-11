<?php

namespace Database\Seeders;

use App\Models\Rol;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Un usuario de prueba por rol, todos con la misma contraseña de prueba.
 */
class UsuarioPruebaSeeder extends Seeder
{
    public const CLAVE = '12345678*';

    public function run(): void
    {
        $usuarios = [
            [Rol::DIRECTOR, 'Director de Carrera (prueba)', 'director@cae.test'],
            [Rol::EDITOR_INSTITUCIONAL, 'Editor Institucional (prueba)', 'institucional@cae.test'],
            [Rol::EDITOR_COMUNICACION, 'Editor de Comunicación (prueba)', 'comunicacion@cae.test'],
            [Rol::USUARIO, 'Usuario (prueba)', 'usuario@cae.test'],
        ];

        foreach ($usuarios as [$slug, $nombre, $correo]) {
            User::updateOrCreate(['email' => $correo], [
                'name' => $nombre,
                'password' => self::CLAVE,
                'rol_id' => Rol::where('slug', $slug)->value('id'),
                'activo' => true,
            ]);
        }
    }
}
