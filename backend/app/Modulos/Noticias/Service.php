<?php

namespace App\Modulos\Noticias;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class Service
{
    /**
     * @return Collection<int, Model>
     */
    public function listar(bool $soloPublicadas = false): Collection
    {
        $query = Model::query()->with('autor');

        if ($soloPublicadas) {
            $query->where('publicada', true)
                ->orderByDesc('publicada_en')
                ->orderByDesc('created_at');
        } else {
            $query->orderByDesc('created_at');
        }

        return $query->get();
    }

    public function obtener(int $id): Model
    {
        return Model::query()->with('autor')->findOrFail($id);
    }

    public function crear(array $datos, int $userId): Model
    {
        if (isset($datos['imagen']) && $datos['imagen'] instanceof UploadedFile) {
            $path = $datos['imagen']->store('noticias', 'public');
            $datos['imagen'] = $path;
        }

        $datos['user_id'] = $userId;

        if (!empty($datos['publicada']) && empty($datos['publicada_en'])) {
            $datos['publicada_en'] = now();
        }

        return Model::create($datos);
    }

    public function actualizar(int $id, array $datos): Model
    {
        $noticia = Model::findOrFail($id);

        if (isset($datos['imagen']) && $datos['imagen'] instanceof UploadedFile) {
            if ($noticia->imagen && Storage::disk('public')->exists($noticia->imagen)) {
                Storage::disk('public')->delete($noticia->imagen);
            }
            $path = $datos['imagen']->store('noticias', 'public');
            $datos['imagen'] = $path;
        }

        if (!empty($datos['publicada']) && empty($noticia->publicada_en)) {
            $datos['publicada_en'] = now();
        }

        $noticia->update($datos);

        return $noticia->fresh('autor');
    }

    public function eliminar(int $id): bool
    {
        $noticia = Model::findOrFail($id);

        if ($noticia->imagen && Storage::disk('public')->exists($noticia->imagen)) {
            Storage::disk('public')->delete($noticia->imagen);
        }

        return (bool) $noticia->delete();
    }
}
