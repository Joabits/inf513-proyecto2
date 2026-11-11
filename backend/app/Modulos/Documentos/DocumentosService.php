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

    public function __construct(private Bitacora $bitacora) {}

    /** Son decenas de documentos: se entregan todos y el panel filtra sin volver a pedir. */
    public function listar(): Collection
    {
        return Documento::withCount('versiones')->latest('updated_at')->latest('id')->get();
    }

    public function crear(array $datos, UploadedFile $archivo, User $usuario): Documento
    {
        $documento = Documento::create([...$datos, ...$this->guardarArchivo($archivo)]);

        $this->bitacora->accion($usuario, 'crear', $documento, $documento->titulo);

        return $documento;
    }

    /** Si llega un archivo nuevo, el actual pasa al historial en la misma transacción. */
    public function actualizar(Documento $documento, array $datos, ?UploadedFile $archivo, User $usuario): Documento
    {
        DB::transaction(function () use ($documento, $datos, $archivo) {
            if ($archivo) {
                $documento->versiones()->create($documento->only(['archivo', 'nombre_original', 'tipo', 'tamano']));
                $datos = [...$datos, ...$this->guardarArchivo($archivo)];
            }

            $documento->update($datos);
        });

        $detalle = $archivo ? $documento->titulo.' (archivo reemplazado)' : $documento->titulo;
        $this->bitacora->accion($usuario, 'editar', $documento, $detalle);

        return $documento;
    }

    /** Borra el documento, su historial y todos sus archivos. */
    public function eliminar(Documento $documento, User $usuario): void
    {
        $archivos = $documento->versiones()->pluck('archivo')->push($documento->archivo)->all();

        $documento->delete();
        Storage::disk(self::DISCO)->delete($archivos);

        $this->bitacora->accion($usuario, 'eliminar', 'Documento #'.$documento->id, $documento->titulo);
    }

    private function guardarArchivo(UploadedFile $archivo): array
    {
        return [
            // Nombre generado por Laravel: nunca se guarda con el nombre que trae el archivo
            'archivo' => $archivo->store('documentos', self::DISCO),
            'nombre_original' => mb_substr($archivo->getClientOriginalName(), 0, 255),
            'tipo' => $archivo->extension(),
            'tamano' => $archivo->getSize(),
        ];
    }
}
