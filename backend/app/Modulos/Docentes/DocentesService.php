<?php

namespace App\Modulos\Docentes;

use App\Compartido\Servicios\Bitacora;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DocentesService
{
    private const CARPETA = 'personal';

    public function __construct(private Bitacora $bitacora) {}

    /** Lo que ve el visitante: solo las personas visibles. */
    public function publica(): Collection
    {
        return $this->ordenadas(Persona::where('visible', true));
    }

    public function gestion(): Collection
    {
        return $this->ordenadas(Persona::query());
    }

    /** Primero por grupo (en el orden de Persona::GRUPOS) y dentro de cada grupo por su orden. */
    private function ordenadas(Builder $consulta): Collection
    {
        $casos = collect(array_keys(Persona::GRUPOS))->map(fn ($grupo, $i) => "WHEN '{$grupo}' THEN {$i}")->implode(' ');

        return $consulta->orderByRaw("CASE grupo {$casos} END")->orderBy('orden')->orderBy('id')->get();
    }

    /** La persona nueva va al final de su grupo. */
    public function crear(array $datos, ?UploadedFile $foto, User $usuario): Persona
    {
        $persona = Persona::create([
            ...$datos,
            'orden' => $this->siguienteOrden($datos['grupo']),
            'foto' => $foto?->store(self::CARPETA, 'public'),
        ]);

        $this->bitacora->accion($usuario, 'crear', $persona, $persona->nombre);

        return $persona;
    }

    public function actualizar(Persona $persona, array $datos, ?UploadedFile $foto, bool $quitarFoto, User $usuario): Persona
    {
        // Si cambia de grupo, pasa al final del grupo nuevo
        if ($datos['grupo'] !== $persona->grupo) {
            $datos['orden'] = $this->siguienteOrden($datos['grupo']);
        }

        if ($foto || $quitarFoto) {
            $this->borrarFoto($persona);
            $datos['foto'] = $foto?->store(self::CARPETA, 'public');
        }

        $persona->update($datos);

        $this->bitacora->accion($usuario, 'editar', $persona, $persona->nombre);

        return $persona;
    }

    public function eliminar(Persona $persona, User $usuario): void
    {
        $this->borrarFoto($persona);
        $persona->delete();

        $this->bitacora->accion($usuario, 'eliminar', 'Persona #'.$persona->id, $persona->nombre);
    }

    /** Guarda el orden de un grupo tal como llega en la lista de ids. */
    public function ordenar(string $grupo, array $ids, User $usuario): void
    {
        DB::transaction(function () use ($grupo, $ids) {
            foreach ($ids as $orden => $id) {
                Persona::whereKey($id)->where('grupo', $grupo)->update(['orden' => $orden]);
            }
        });

        $this->bitacora->accion($usuario, 'editar', 'Personal: orden', Persona::GRUPOS[$grupo]);
    }

    private function siguienteOrden(string $grupo): int
    {
        return (Persona::where('grupo', $grupo)->max('orden') ?? -1) + 1;
    }

    private function borrarFoto(Persona $persona): void
    {
        if ($persona->foto) {
            Storage::disk('public')->delete($persona->foto);
        }
    }
}
