<?php

namespace App\Modulos\Documentos;

use App\Compartido\Servicios\Bitacora;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DocumentosService
{
    /** Disco privado: los archivos solo salen por la API, nunca por una URL directa. */
    public const DISCO = 'local';

    private const RELACIONES = ['categoria', 'autor'];

    public function __construct(private Bitacora $bitacora) {}

    /** Son decenas de documentos: se entregan todos y el panel filtra sin volver a pedir. */
    public function listar(): Collection
    {
        return Documento::with(self::RELACIONES)->withCount('versiones')->latest('updated_at')->latest('id')->get();
    }

    public function categorias(): Collection
    {
        return Categoria::orderBy('nombre')->get();
    }

    public function crearCategoria(string $nombre, User $usuario): Categoria
    {
        $categoria = Categoria::create(['nombre' => $nombre]);

        $this->bitacora->accion($usuario, 'crear', $categoria, $categoria->nombre);

        return $categoria;
    }

    public function crear(array $datos, UploadedFile $archivo, User $usuario): Documento
    {
        $documento = Documento::create([...$datos, ...$this->guardarArchivo($archivo, $usuario)]);

        $this->bitacora->accion($usuario, 'crear', $documento, $documento->titulo);

        return $this->completo($documento);
    }

    /** Si llega un archivo nuevo, el actual pasa al historial en la misma transacción. */
    public function actualizar(Documento $documento, array $datos, ?UploadedFile $archivo, User $usuario): Documento
    {
        DB::transaction(function () use ($documento, $datos, $archivo, $usuario) {
            if ($archivo) {
                $documento->versiones()->create($documento->only(['archivo', 'nombre_original', 'tipo', 'mime', 'tamano', 'user_id']));
                $datos = [...$datos, ...$this->guardarArchivo($archivo, $usuario)];
            }

            $documento->update($datos);
        });

        $detalle = $archivo ? $documento->titulo.' (archivo reemplazado)' : $documento->titulo;
        $this->bitacora->accion($usuario, 'editar', $documento, $detalle);

        return $this->completo($documento);
    }

    /** Borra el documento, su historial y todos sus archivos. */
    public function eliminar(Documento $documento, User $usuario): void
    {
        $archivos = $documento->versiones()->pluck('archivo')->push($documento->archivo)->all();

        $documento->delete();
        Storage::disk(self::DISCO)->delete($archivos);

        $this->bitacora->accion($usuario, 'eliminar', 'Documento #'.$documento->id, $documento->titulo);
    }

    private function completo(Documento $documento): Documento
    {
        return $documento->load(self::RELACIONES)->loadCount('versiones');
    }

    private function guardarArchivo(UploadedFile $archivo, User $usuario): array
    {
        return [
            // Nombre generado por Laravel: nunca se guarda con el nombre que trae el archivo
            'archivo' => $archivo->store('documentos', self::DISCO),
            'nombre_original' => mb_substr($archivo->getClientOriginalName(), 0, 255),
            'tipo' => $archivo->extension(),
            'mime' => $archivo->getMimeType(),
            'tamano' => $archivo->getSize(),
            'user_id' => $usuario->id,
        ];
    }
}
