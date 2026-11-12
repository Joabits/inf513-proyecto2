<?php

namespace App\Modulos\Usuarios;

use App\Compartido\Servicios\Bitacora;
use App\Models\Rol;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Gestión de usuarios (CU-26). Reglas que protegen el acceso al panel:
 *  - nadie puede desactivarse, eliminarse ni cambiarse el rol a sí mismo;
 *  - siempre queda al menos un Director de Carrera activo.
 *
 * Crear, eliminar, cambiar de rol y activar o desactivar ya los registran en la bitácora
 * los triggers de PostgreSQL (tipo "auditoria"). Aquí solo se registra lo que ellos no ven:
 * la edición del nombre o el correo y el cambio de contraseña.
 */
class UsuariosService
{
    public function __construct(private Bitacora $bitacora) {}

    /** Son pocas cuentas: se entregan todas y el panel filtra sin volver a pedir. */
    public function listar(): Collection
    {
        return $this->consulta()->orderByDesc('activo')->orderBy('name')->get();
    }

    public function roles(): Collection
    {
        return Rol::orderBy('id')->get();
    }

    public function crear(array $datos): User
    {
        $usuario = User::create([
            'name' => $datos['nombre'],
            'email' => $datos['email'],
            'password' => $datos['password'],
            'rol_id' => $datos['rol_id'],
            'activo' => $datos['activo'] ?? true,
        ]);

        return $this->completo($usuario);
    }

    public function actualizar(User $usuario, array $datos, User $autor): User
    {
        $rolNuevo = (int) $datos['rol_id'];

        if ($rolNuevo !== (int) $usuario->rol_id) {
            $this->exigirQueNoSeaUsted($usuario, $autor, 'rol_id', 'No puede cambiar su propio rol.');
            $this->exigirOtroDirector($usuario, 'rol_id', 'Es el único Director de Carrera activo: asigne ese rol a otra cuenta antes de cambiarle el rol.');
        }

        $usuario->fill(['name' => $datos['nombre'], 'email' => $datos['email'], 'rol_id' => $rolNuevo]);
        $cambioDatos = $usuario->isDirty(['name', 'email']);
        $usuario->save();

        if ($cambioDatos) {
            $this->bitacora->accion($autor, 'editar', $usuario, $usuario->email);
        }

        return $this->completo($usuario);
    }

    public function cambiarEstado(User $usuario, bool $activo, User $autor): User
    {
        if (! $activo) {
            $this->exigirQueNoSeaUsted($usuario, $autor, 'activo', 'No puede desactivar su propia cuenta.');
            $this->exigirOtroDirector($usuario, 'activo', 'Es el único Director de Carrera activo: no se puede desactivar.');
        }

        $usuario->update(['activo' => $activo]);

        // Una cuenta desactivada sale del panel en ese momento, no cuando venza su sesión
        if (! $activo) {
            $this->cerrarSesiones($usuario);
        }

        return $this->completo($usuario);
    }

    /** El Director asigna una contraseña nueva. Las sesiones abiertas de esa cuenta se cierran. */
    public function cambiarClave(User $usuario, string $clave, User $autor): void
    {
        $usuario->update(['password' => $clave]);

        if ($usuario->isNot($autor)) {
            $this->cerrarSesiones($usuario);
        }

        // Nunca se guarda la contraseña en la bitácora: solo que se cambió
        $this->bitacora->accion($autor, 'cambiar_clave', $usuario, $usuario->email);
    }

    public function eliminar(User $usuario, User $autor): void
    {
        $this->exigirQueNoSeaUsted($usuario, $autor, 'usuario', 'No puede eliminar su propia cuenta.');
        $this->exigirOtroDirector($usuario, 'usuario', 'Es el único Director de Carrera activo: no se puede eliminar.');

        $this->cerrarSesiones($usuario);
        $usuario->delete();
    }

    /** Cuentas con su rol y la fecha de su último ingreso (de la bitácora). */
    private function consulta(): Builder
    {
        return User::query()
            ->with('rol')
            ->addSelect(['ultimo_ingreso' => DB::table('bitacora')
                ->selectRaw('max(created_at)')
                ->whereColumn('bitacora.user_id', 'users.id')
                ->where('tipo', 'ingreso_ok'),
            ]);
    }

    /** La cuenta tal como aparece en el listado, para reemplazarla en el panel sin volver a pedir todo. */
    private function completo(User $usuario): User
    {
        return $this->consulta()->findOrFail($usuario->getKey());
    }

    private function exigirQueNoSeaUsted(User $usuario, User $autor, string $campo, string $mensaje): void
    {
        if ($usuario->is($autor)) {
            throw ValidationException::withMessages([$campo => $mensaje]);
        }
    }

    /** Impide dejar el portal sin ningún Director de Carrera activo. */
    private function exigirOtroDirector(User $usuario, string $campo, string $mensaje): void
    {
        $esDirectorActivo = $usuario->activo && $usuario->rol?->slug === Rol::DIRECTOR;

        if (! $esDirectorActivo) {
            return;
        }

        $otros = User::query()
            ->whereKeyNot($usuario->getKey())
            ->where('activo', true)
            ->whereHas('rol', fn ($rol) => $rol->where('slug', Rol::DIRECTOR))
            ->exists();

        if (! $otros) {
            throw ValidationException::withMessages([$campo => $mensaje]);
        }
    }

    private function cerrarSesiones(User $usuario): void
    {
        if (config('session.driver') === 'database') {
            DB::table(config('session.table', 'sessions'))->where('user_id', $usuario->getKey())->delete();
        }
    }
}
