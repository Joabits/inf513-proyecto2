<?php

namespace App\Modulos\Galeria;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class Service
{
    public function listar(bool $soloPublicadas = false)
    {
        return Model::with('autor')
            ->when($soloPublicadas, fn ($query) => $query->where('publicado', true))
            ->orderByDesc('created_at')
            ->get();
    }

    public function obtener(int $id): Model
    {
        return Model::with('autor')->findOrFail($id);
    }

    public function crear(array $datos, int $userId): Model
    {
        if (isset($datos['imagen']) && $datos['imagen'] instanceof UploadedFile) {
            $datos['imagen'] = $datos['imagen']->store('galeria', 'public');
        }

        $datos['user_id'] = $userId;

        return Model::create($datos)->load('autor');
    }

    public function actualizar(int $id, array $datos): Model
    {
        $galeria = Model::findOrFail($id);

        if (isset($datos['imagen']) && $datos['imagen'] instanceof UploadedFile) {
            if ($galeria->imagen && Storage::disk('public')->exists($galeria->imagen)) {
                Storage::disk('public')->delete($galeria->imagen);
            }
            $datos['imagen'] = $datos['imagen']->store('galeria', 'public');
        } else {
            unset($datos['imagen']);
        }

        $galeria->update($datos);

        return $galeria->fresh(['autor']);
    }

    public function eliminar(int $id): bool
    {
        $galeria = Model::findOrFail($id);

        if ($galeria->imagen && Storage::disk('public')->exists($galeria->imagen)) {
            Storage::disk('public')->delete($galeria->imagen);
        }

        return (bool) $galeria->delete();
    }
}
