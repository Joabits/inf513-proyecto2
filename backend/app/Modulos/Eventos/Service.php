<?php

namespace App\Modulos\Eventos;

use Illuminate\Database\Eloquent\Collection;

class Service
{
    /**
     * @return Collection<int, Model>
     */
    public function listar(bool $soloPublicados = false): Collection
    {
        $query = Model::with('autor')->orderBy('fecha_inicio', 'desc');

        if ($soloPublicados) {
            $query->where('publicado', true);
        }

        return $query->get();
    }

    public function obtenerPorId(int $id): Model
    {
        return Model::with('autor')->findOrFail($id);
    }

    public function crear(array $datos, int $userId): Model
    {
        $datos['user_id'] = $userId;

        return Model::create($datos);
    }

    public function actualizar(int $id, array $datos): Model
    {
        $evento = Model::findOrFail($id);
        $evento->update($datos);

        return $evento;
    }

    public function eliminar(int $id): void
    {
        $evento = Model::findOrFail($id);
        $evento->delete();
    }
}
