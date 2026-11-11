<?php

namespace Database\Seeders;

use App\Models\Rol;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Un usuario de prueba por rol, todos con la misma contraseña de prueba.
 *
 * Solo se crean en la computadora de cada integrante (APP_ENV=local) y en las pruebas automáticas:
 * la contraseña está en el repositorio público. En el servidor la cuenta del Director se crea con
 * «php artisan usuarios:crear-director», que pide la contraseña sin mostrarla.
 */
class UsuarioPruebaSeeder extends Seeder
{
    public const CLAVE = '12345678*';

    public function run(): void
    {
        if (! app()->environment('local', 'testing')) {
            $this->command?->warn('Usuarios de prueba omitidos (APP_ENV no es local). Cree el Director con: php artisan usuarios:crear-director');

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
                'password' => self::CLAVE,
                'rol_id' => Rol::where('slug', $slug)->value('id'),
                'activo' => true,
            ]);
        }
    }
}
