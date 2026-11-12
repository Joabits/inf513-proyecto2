<?php

namespace App\Modulos\Institucional;

use App\Compartido\Servicios\Bitacora;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class InstitucionalService
{
    public function __construct(private Bitacora $bitacora) {}

    public function informacion(): array
    {
        return [
            'contenido' => Institucional::first(),
            'hitos' => Hito::orderBy('anio')->orderBy('orden')->get(),
        ];
    }

    public function actualizarContenido(array $datos, User $usuario): void
    {
        (Institucional::first() ?? new Institucional)->fill($datos)->save();

        $this->bitacora->accion($usuario, 'editar', 'Información institucional: contenido');
    }

    /**
     * Los hitos se guardan como lista completa. La línea de tiempo siempre va en orden cronológico;
     * dos hitos del mismo año conservan el orden en que se escribieron.
     */
    public function guardarHitos(array $hitos, User $usuario): void
    {
        DB::transaction(function () use ($hitos) {
            Hito::query()->delete();

            foreach (array_values($hitos) as $orden => $hito) {
                Hito::create([...$hito, 'orden' => $orden]);
            }
        });

        $this->bitacora->accion($usuario, 'editar', 'Información institucional: hitos');
    }
}
