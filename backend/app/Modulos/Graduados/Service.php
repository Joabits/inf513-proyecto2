<?php

namespace App\Modulos\Graduados;

use App\Models\Rol;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class Service
{
    /** Los mismos campos que filtra el buscador de la pantalla (frontend: graduados/paginas/GestionGraduados.tsx). */
    private const CAMPOS_BUSQUEDA = ['nombre_completo', 'ci', 'modalidad', 'titulo_tema'];

    /**
     * Graduados ordenados por nombre. Con $buscar, solo los que lo contienen en nombre, CI, modalidad o tema, sin
     * distinguir mayúsculas ni tildes: la misma búsqueda que hace el panel, para que la exportación lleve lo que se ve.
     */
    public function listar(?string $buscar = null): Collection
    {
        $graduados = Model::with(['autor', 'cuenta'])->orderBy('nombre_completo')->get();

        $buscado = self::normalizar((string) $buscar);
        if ($buscado === '') {
            return $graduados;
        }

        return $graduados->filter(fn (Model $g) => collect(self::CAMPOS_BUSQUEDA)
            ->contains(fn ($campo) => str_contains(self::normalizar((string) $g->{$campo}), $buscado)))->values();
    }

    private static function normalizar(string $texto): string
    {
        return Str::lower(Str::ascii(trim($texto)));
    }

    /** Directorio público: sin los graduados cuya cuenta espera aprobación (sus datos todavía no se validaron). */
    public function listarPublicos(): Collection
    {
        return $this->listar()->reject(fn (Model $g) => $g->cuentaPendiente())->values();
    }

    /**
     * CU-10: el graduado solicita su cuenta desde el portal. Se crean juntas su cuenta de rol Usuario, inactiva hasta
     * que la Carrera la apruebe, y su registro de graduado, con los datos que escribió.
     */
    public function solicitarCuenta(array $datos): Model
    {
        return DB::transaction(function () use ($datos) {
            $cuenta = new User([
                'name' => $datos['nombre_completo'],
                'email' => $datos['correo'],
                'password' => $datos['password'],
                'rol_id' => Rol::where('slug', Rol::USUARIO)->value('id'),
                'activo' => false,
            ]);

            // Quien crea la cuenta es el propio graduado: el trigger de auditoría lo registra como autor. Sin esto
            // tomaría la sesión que tenga abierta ese navegador (alguien del personal) o a nadie. Solo dura la transacción.
            if (DB::getDriverName() === 'pgsql') {
                $cuenta->id = (int) DB::scalar("SELECT nextval(pg_get_serial_sequence('users', 'id'))");
                DB::select("SELECT set_config('app.usuario_id', ?, true)", [(string) $cuenta->id]);
            }

            $cuenta->save();

            return Model::create([
                ...Arr::only($datos, ['nombre_completo', 'ci', 'correo', 'telefono', 'gestion_ingreso', 'gestion_egreso', 'modalidad', 'titulo_tema']),
                'cuenta_id' => $cuenta->id,
                'user_id' => $cuenta->id,
            ])->setRelation('cuenta', $cuenta);
        });
    }

    /** CU-18: la Carrera revisó los datos y activa la cuenta: desde ahora el graduado puede ingresar. */
    public function aprobarCuenta(int $id): Model
    {
        $graduado = Model::with('cuenta')->findOrFail($id);
        abort_unless($graduado->cuentaPendiente(), 422, 'Este graduado no tiene una cuenta por aprobar.');
        $graduado->cuenta->update(['activo' => true]);

        return $graduado;
    }

    /** CU-18: la solicitud no corresponde a un graduado de la Carrera: se borran el registro y la cuenta sin usar. */
    public function rechazarSolicitud(int $id): Model
    {
        $graduado = Model::with('cuenta')->findOrFail($id);
        abort_unless($graduado->cuentaPendiente(), 422, 'Este graduado no tiene una solicitud de cuenta pendiente.');

        DB::transaction(function () use ($graduado) {
            $cuenta = $graduado->cuenta;
            $graduado->delete();
            $cuenta->delete();
        });

        return $graduado;
    }

    /** CU-10: el registro del propio graduado (por su cuenta), o null si todavía no cargó sus datos. */
    public function deCuenta(User $cuenta): ?Model
    {
        return Model::where('cuenta_id', $cuenta->id)->first();
    }

    /** CU-10: el graduado crea o actualiza su propio registro. Queda como cargado por él mismo. */
    public function guardarDeCuenta(User $cuenta, array $datos): Model
    {
        $graduado = $this->deCuenta($cuenta);
        if ($graduado) {
            $graduado->update($datos);

            return $graduado;
        }

        return Model::create([...$datos, 'cuenta_id' => $cuenta->id, 'user_id' => $cuenta->id]);
    }

    public function crear(array $datos, int $userId): Model
    {
        $datos['user_id'] = $userId;

        return Model::create($datos);
    }

    public function actualizar(int $id, array $datos): Model
    {
        $graduado = Model::findOrFail($id);
        $graduado->update($datos);

        return $graduado;
    }

    public function eliminar(int $id): bool
    {
        $graduado = Model::findOrFail($id);

        return (bool) $graduado->delete();
    }
}
