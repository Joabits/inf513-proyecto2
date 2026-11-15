<?php

namespace App\Modulos\Vinculacion;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class Service
{
    /**
     * @return Collection<int, Model>
     */
    public function listar(bool $soloPublicados = false): Collection
    {
        return Model::query()
            ->with('autor')
            ->when($soloPublicados, fn ($q) => $q->where('publicado', true))
            ->orderByDesc('created_at')
            ->get();
    }

    public function obtener(int $id): Model
    {
        return Model::query()->with('autor')->findOrFail($id);
    }

    public function crear(array $datos, int $userId): Model
    {
        if (isset($datos['imagen']) && $datos['imagen'] instanceof UploadedFile) {
            $datos['imagen'] = $datos['imagen']->store('vinculacion', 'public');
        } else {
            unset($datos['imagen']);
        }

        $datos['user_id'] = $userId;

        return Model::create($datos)->fresh('autor');
    }

    public function actualizar(int $id, array $datos): Model
    {
        $registro = Model::findOrFail($id);

        if (isset($datos['imagen']) && $datos['imagen'] instanceof UploadedFile) {
            if ($registro->imagen && Storage::disk('public')->exists($registro->imagen)) {
                Storage::disk('public')->delete($registro->imagen);
            }
            $datos['imagen'] = $datos['imagen']->store('vinculacion', 'public');
        } else {
            unset($datos['imagen']);
        }

        $registro->update($datos);

        return $registro->fresh('autor');
    }

    public function eliminar(int $id): bool
    {
        $registro = Model::findOrFail($id);

        if ($registro->imagen && Storage::disk('public')->exists($registro->imagen)) {
            Storage::disk('public')->delete($registro->imagen);
        }

        return (bool) $registro->delete();
    }
}
