<?php

namespace App\Modulos\Usuarios;

use App\Compartido\Servicios\Bitacora;
use App\Models\Rol;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

/**
 * Crea la cuenta del Director de Carrera en el servidor, donde el seeder no crea usuarios de prueba
 * (su contraseña está en el repositorio público). La contraseña se escribe al ejecutarlo y no se muestra,
 * así que no queda en el código ni en el historial de la terminal.
 *
 *   php artisan usuarios:crear-director
 *
 * Con las demás cuentas el Director sigue desde el panel (Usuarios, CU-26).
 * Si el correo ya existe, pregunta antes de convertir esa cuenta en Director.
 */
class CrearDirectorCommand extends Command
{
    protected $signature = 'usuarios:crear-director';

    protected $description = 'Crea la cuenta del Director de Carrera (pide la contraseña sin mostrarla)';

    public function handle(Bitacora $bitacora): int
    {
        $rolDirector = Rol::where('slug', Rol::DIRECTOR)->value('id');

        if ($rolDirector === null) {
            $this->error('Todavía no existen los roles. Ejecute primero: php artisan db:seed');

            return self::FAILURE;
        }

        // Mismas reglas y la misma limpieza que el formulario de Usuarios (GuardarUsuarioRequest)
        $datos = [
            'nombre' => preg_replace('/\s+/u', ' ', trim((string) $this->ask('Nombre completo', 'Director de Carrera'))),
            'email' => Str::lower(trim((string) $this->ask('Correo electrónico'))),
            'password' => (string) $this->secret('Contraseña (no se muestra al escribir)'),
            'password_confirmation' => (string) $this->secret('Repita la contraseña'),
        ];

        $validacion = Validator::make(
            $datos,
            [
                'nombre' => ['required', 'string', 'min:3', 'max:120'],
                'email' => ['required', 'string', 'email', 'max:255'],
                'password' => ['required', 'string', 'max:255', 'confirmed', ...CambiarClaveRequest::reglasClave()],
            ],
            [],
            ['nombre' => 'nombre', 'email' => 'correo electrónico', 'password' => 'contraseña'],
        );

        if ($validacion->fails()) {
            foreach ($validacion->errors()->all() as $mensaje) {
                $this->error($mensaje);
            }

            return self::FAILURE;
        }

        $cuenta = ['name' => $datos['nombre'], 'password' => $datos['password'], 'rol_id' => $rolDirector, 'activo' => true];
        $existente = User::where('email', $datos['email'])->first();

        if ($existente === null) {
            // Los triggers de PostgreSQL registran la cuenta nueva en la bitácora
            User::create(['email' => $datos['email'], ...$cuenta]);
        } elseif ($this->confirm('Ya existe una cuenta con ese correo. ¿Convertirla en Director, activarla y cambiarle la contraseña?')) {
            $existente->update($cuenta);
            // Los triggers no ven el cambio de contraseña: se anota aquí (sin la contraseña)
            $bitacora->accion($existente, 'cambiar_clave', $existente, 'Desde la consola del servidor');
        } else {
            $this->warn('No se cambió nada.');

            return self::FAILURE;
        }

        $this->info("Listo: {$datos['email']} ya puede ingresar como Director de Carrera escribiendo /gestion en la dirección del portal.");

        return self::SUCCESS;
    }
}
