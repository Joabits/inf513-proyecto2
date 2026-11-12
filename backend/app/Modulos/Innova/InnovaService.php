<?php

namespace App\Modulos\Innova;

use App\Compartido\Servicios\Bitacora;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/** Página de la Empresa Junior INNOVA (CU-22). */
class InnovaService
{
    public function __construct(private Bitacora $bitacora) {}

    public function informacion(): array
    {
        return [
            'contenido' => Innova::first(),
            'servicios' => ServicioInnova::orderBy('orden')->get(),
        ];
    }

    public function actualizarContenido(array $datos, User $usuario): void
    {
        $innova = Innova::first() ?? new Innova;
        $antes = $innova->exists ? $innova->recibe_solicitudes : null;

        $innova->fill($datos)->save();

        $detalle = $antes !== null && $antes !== $innova->recibe_solicitudes
            ? ($innova->recibe_solicitudes ? 'Abrió la recepción de solicitudes' : 'Cerró la recepción de solicitudes')
            : null;

        $this->bitacora->accion($usuario, 'editar', 'Empresa Junior INNOVA: presentación', $detalle);
    }

    /** La lista se edita completa: su posición es el orden en que se muestra. */
    public function guardarServicios(array $servicios, User $usuario): void
    {
        DB::transaction(function () use ($servicios) {
            ServicioInnova::query()->delete();

            foreach (array_values($servicios) as $orden => $servicio) {
                ServicioInnova::create([...$servicio, 'orden' => $orden]);
            }
        });

        $this->bitacora->accion($usuario, 'editar', 'Empresa Junior INNOVA: servicios');
    }
}
