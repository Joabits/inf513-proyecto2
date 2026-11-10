<?php

namespace App\Modulos\Inicio;

use App\Compartido\Servicios\Bitacora;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class InicioService
{
    private const MAX_BANNERS = 5;

    public function __construct(private Bitacora $bitacora) {}

    public function contenido(): array
    {
        return [
            'portada' => Portada::first(),
            'banners' => Banner::orderBy('orden')->get(),
            'cifras' => Cifra::orderBy('orden')->get(),
            'accesos' => Acceso::orderBy('orden')->get(),
        ];
    }

    public function actualizarPortada(array $datos, User $usuario): void
    {
        (Portada::first() ?? new Portada)->fill($datos)->save();

        $this->bitacora->accion($usuario, 'editar', 'Página de inicio: presentación y mensaje');
    }

    public function guardarCifras(array $cifras, User $usuario): void
    {
        $this->reemplazar(Cifra::class, $cifras);

        $this->bitacora->accion($usuario, 'editar', 'Página de inicio: cifras');
    }

    public function guardarAccesos(array $accesos, User $usuario): void
    {
        $this->reemplazar(Acceso::class, $accesos);

        $this->bitacora->accion($usuario, 'editar', 'Página de inicio: accesos rápidos');
    }

    public function agregarBanner(UploadedFile $imagen, array $datos, User $usuario): void
    {
        if (Banner::count() >= self::MAX_BANNERS) {
            throw ValidationException::withMessages([
                'imagen' => 'Solo se permiten '.self::MAX_BANNERS.' imágenes. Elimine una antes de agregar otra.',
            ]);
        }

        Banner::create([
            ...$datos,
            'imagen' => $imagen->store('inicio/banners', 'public'),
            'orden' => (Banner::max('orden') ?? -1) + 1,
        ]);

        $this->bitacora->accion($usuario, 'crear', 'Página de inicio: banner');
    }

    public function eliminarBanner(Banner $banner, User $usuario): void
    {
        Storage::disk('public')->delete($banner->imagen);
        $banner->delete();

        $this->bitacora->accion($usuario, 'eliminar', 'Página de inicio: banner');
    }

    public function ordenarBanners(array $ids, User $usuario): void
    {
        DB::transaction(function () use ($ids) {
            foreach ($ids as $orden => $id) {
                Banner::whereKey($id)->update(['orden' => $orden]);
            }
        });

        $this->bitacora->accion($usuario, 'editar', 'Página de inicio: orden del banner');
    }

    public function cambiarFotoDirector(UploadedFile $foto, User $usuario): void
    {
        $portada = Portada::firstOrFail();

        $this->borrarFoto($portada);
        $portada->update(['director_foto' => $foto->store('inicio/director', 'public')]);

        $this->bitacora->accion($usuario, 'editar', 'Página de inicio: foto del Director');
    }

    public function quitarFotoDirector(User $usuario): void
    {
        $portada = Portada::firstOrFail();

        $this->borrarFoto($portada);
        $portada->update(['director_foto' => null]);

        $this->bitacora->accion($usuario, 'eliminar', 'Página de inicio: foto del Director');
    }

    private function borrarFoto(Portada $portada): void
    {
        if ($portada->director_foto) {
            Storage::disk('public')->delete($portada->director_foto);
        }
    }

    /** Cifras y accesos se editan como una lista completa: su posición es el orden. */
    private function reemplazar(string $modelo, array $filas): void
    {
        DB::transaction(function () use ($modelo, $filas) {
            $modelo::query()->delete();

            foreach ($filas as $orden => $fila) {
                $modelo::create([...$fila, 'orden' => $orden]);
            }
        });
    }
}
