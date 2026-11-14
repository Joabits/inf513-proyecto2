<?php

namespace App\Modulos\Revista;

use App\Compartido\Servicios\Bitacora;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/** Revista Académica Institucional INNOVAR (CU-21). */
class RevistaService
{
    /** Disco privado: los PDF solo salen por la API, nunca por una dirección directa. */
    public const DISCO_PDF = 'local';

    private const DISCO_PORTADAS = 'public';

    public function __construct(private Bitacora $bitacora) {}

    /** Lo que ve el visitante: solo las ediciones publicadas. */
    public function publica(): array
    {
        return $this->contenido(Edicion::where('publicada', true));
    }

    public function gestion(): array
    {
        return $this->contenido(Edicion::query());
    }

    private function contenido($ediciones): array
    {
        /** @var Collection $lista */
        $lista = $ediciones->with('articulos')->recientes()->get();

        return ['revista' => Revista::first(), 'ediciones' => $lista];
    }

    public function actualizarContenido(array $datos, User $usuario): void
    {
        (Revista::first() ?? new Revista)->fill($datos)->save();

        $this->bitacora->accion($usuario, 'editar', 'Revista INNOVAR: presentación y colaboradores');
    }

    // ---------- Ediciones ----------

    public function crearEdicion(array $datos, ?UploadedFile $portada, ?UploadedFile $archivo, User $usuario): Edicion
    {
        $edicion = Edicion::create([
            ...$datos,
            'portada' => $portada?->store('revista/portadas', self::DISCO_PORTADAS),
            ...$this->datosDeArchivo($archivo, 'revista/ediciones'),
            'user_id' => $usuario->id,
        ]);

        $this->bitacora->accion($usuario, 'crear', $edicion, $edicion->nombre());

        return $edicion;
    }

    public function actualizarEdicion(Edicion $edicion, array $datos, ?UploadedFile $portada, ?UploadedFile $archivo, bool $quitarPortada, bool $quitarArchivo, User $usuario): Edicion
    {
        if ($portada || $quitarPortada) {
            $this->borrar(self::DISCO_PORTADAS, $edicion->portada);
            $datos['portada'] = $portada?->store('revista/portadas', self::DISCO_PORTADAS);
        }

        if ($archivo || $quitarArchivo) {
            $this->borrar(self::DISCO_PDF, $edicion->archivo);
            $datos = [...$datos, ...$this->datosDeArchivo($archivo, 'revista/ediciones')];
        }

        $edicion->update($datos);

        $this->bitacora->accion($usuario, 'editar', $edicion, $edicion->nombre());

        return $edicion;
    }

    /** Publicar u ocultar no cambia el contenido: no toca la fecha de actualización. */
    public function cambiarPublicacion(Edicion $edicion, bool $publicada, User $usuario): void
    {
        if ($edicion->publicada === $publicada) {
            return;
        }

        $edicion->timestamps = false;
        $edicion->update(['publicada' => $publicada]);
        $edicion->timestamps = true;

        $this->bitacora->accion($usuario, $publicada ? 'publicar' : 'ocultar', $edicion, $edicion->nombre());
    }

    /** Borra la edición, sus artículos y todos sus archivos. */
    public function eliminarEdicion(Edicion $edicion, User $usuario): void
    {
        $nombre = $edicion->nombre();
        $edicion->load('articulos');

        foreach ($edicion->articulos as $articulo) {
            $this->borrar(self::DISCO_PDF, $articulo->archivo);
        }
        $this->borrar(self::DISCO_PDF, $edicion->archivo);
        $this->borrar(self::DISCO_PORTADAS, $edicion->portada);

        $edicion->delete();

        $this->bitacora->accion($usuario, 'eliminar', 'Edicion #'.$edicion->id, $nombre);
    }

    // ---------- Artículos ----------

    /** El artículo nuevo va al final de su edición. */
    public function crearArticulo(Edicion $edicion, array $datos, ?UploadedFile $archivo, User $usuario): Articulo
    {
        $articulo = $edicion->articulos()->create([
            ...$datos,
            ...$this->datosDeArchivo($archivo, 'revista/articulos'),
            'orden' => ($edicion->articulos()->max('orden') ?? -1) + 1,
        ]);

        $this->bitacora->accion($usuario, 'crear', $articulo, $articulo->titulo);

        return $articulo;
    }

    public function actualizarArticulo(Articulo $articulo, array $datos, ?UploadedFile $archivo, bool $quitarArchivo, User $usuario): Articulo
    {
        if ($archivo || $quitarArchivo) {
            $this->borrar(self::DISCO_PDF, $articulo->archivo);
            $datos = [...$datos, ...$this->datosDeArchivo($archivo, 'revista/articulos')];
        }

        $articulo->update($datos);

        $this->bitacora->accion($usuario, 'editar', $articulo, $articulo->titulo);

        return $articulo;
    }

    public function eliminarArticulo(Articulo $articulo, User $usuario): void
    {
        $this->borrar(self::DISCO_PDF, $articulo->archivo);
        $articulo->delete();

        $this->bitacora->accion($usuario, 'eliminar', 'Articulo #'.$articulo->id, $articulo->titulo);
    }

    /** Guarda el orden de los artículos tal como llega en la lista de ids. */
    public function ordenarArticulos(Edicion $edicion, array $ids, User $usuario): void
    {
        DB::transaction(function () use ($edicion, $ids) {
            foreach ($ids as $orden => $id) {
                $edicion->articulos()->whereKey($id)->update(['orden' => $orden]);
            }
        });

        $this->bitacora->accion($usuario, 'editar', $edicion, 'Orden de los artículos');
    }

    // ---------- Archivos ----------

    /** Con archivo nuevo guarda sus datos; sin archivo deja los tres campos en null (quitarlo). */
    private function datosDeArchivo(?UploadedFile $archivo, string $carpeta): array
    {
        return [
            // Nombre generado por Laravel: nunca se guarda con el nombre que trae el archivo
            'archivo' => $archivo?->store($carpeta, self::DISCO_PDF),
            'archivo_nombre' => $archivo ? mb_substr($archivo->getClientOriginalName(), 0, 255) : null,
            'archivo_tamano' => $archivo?->getSize(),
        ];
    }

    private function borrar(string $disco, ?string $ruta): void
    {
        if ($ruta) {
            Storage::disk($disco)->delete($ruta);
        }
    }
}
