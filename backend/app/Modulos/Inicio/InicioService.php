<?php

namespace App\Modulos\Inicio;

use App\Compartido\Servicios\Bitacora;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class InicioService
{
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
