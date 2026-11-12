<?php

namespace App\Modulos\Configuracion;

use App\Compartido\Servicios\Bitacora;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ConfiguracionService
{
    public function __construct(private Bitacora $bitacora) {}

    public function configuracion(): array
    {
        return [
            'contacto' => DatosContacto::first(),
            'redes' => RedSocial::orderBy('orden')->get(),
            'enlaces' => EnlaceInteres::orderBy('orden')->get(),
        ];
    }

    public function actualizarContacto(array $datos, User $usuario): void
    {
        (DatosContacto::first() ?? new DatosContacto)->fill($datos)->save();

        $this->bitacora->accion($usuario, 'editar', 'Configuración: datos de contacto');
    }

    public function guardarRedes(array $redes, User $usuario): void
    {
        $this->reemplazar(RedSocial::class, $redes);

        $this->bitacora->accion($usuario, 'editar', 'Configuración: redes sociales');
    }

    public function guardarEnlaces(array $enlaces, User $usuario): void
    {
        $this->reemplazar(EnlaceInteres::class, $enlaces);

        $this->bitacora->accion($usuario, 'editar', 'Configuración: enlaces de interés');
    }

    /** Las listas se editan completas: su posición es el orden en el que se muestran. */
    private function reemplazar(string $modelo, array $filas): void
    {
        DB::transaction(function () use ($modelo, $filas) {
            $modelo::query()->delete();

            foreach (array_values($filas) as $orden => $fila) {
                $modelo::create([...$fila, 'orden' => $orden]);
            }
        });
    }
}
