<?php

namespace App\Modulos\Graduados;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class Service
{
    private const CAMPOS_BUSQUEDA = ['nombre_completo', 'ci', 'correo', 'gestion_ingreso', 'gestion_egreso', 'modalidad', 'titulo_tema'];

    /**
     * Graduados ordenados por nombre. Con $buscar, solo los que lo contienen en algún dato, sin distinguir
     * mayúsculas ni tildes: la misma búsqueda que hace el panel, para que la exportación lleve lo que se ve.
     */
    public function listar(?string $buscar = null): Collection
    {
        $graduados = Model::with('autor')->orderBy('nombre_completo')->get();

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
