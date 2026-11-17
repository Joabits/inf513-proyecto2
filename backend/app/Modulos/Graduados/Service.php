<?php

namespace App\Modulos\Graduados;

use Illuminate\Database\Eloquent\Collection;

class Service
{
    /**
     * Devuelve todos los graduados ordenados por apellido/nombre.
     */
    public function listar(): Collection
    {
        return Model::with('autor')->orderBy('nombre_completo')->get();
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
