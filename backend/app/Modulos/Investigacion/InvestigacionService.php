<?php

namespace App\Modulos\Investigacion;

use App\Compartido\Servicios\Bitacora;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/** CU-19 Gestionar investigación. La consulta pública (CU-03) usa publica(). */
class InvestigacionService
{
    public function __construct(private Bitacora $bitacora) {}

    /** Lo que ve un visitante: solo los proyectos publicados. */
    public function publica(): array
    {
        return [
            'lineas' => Linea::withCount(['proyectos' => fn ($q) => $q->where('publicado', true)])->orderBy('orden')->get(),
            'proyectos' => Proyecto::with('linea')->where('publicado', true)->orderByDesc('gestion')->orderBy('titulo')->get(),
            'semilleros' => Semillero::orderBy('orden')->get(),
            'contenido' => ContenidoInvestigacion::first(),
        ];
    }

    /** Lo que ve el personal: todos los proyectos, publicados o no. */
    public function gestion(): array
    {
        return [
            'proyectos' => $this->proyectos(),
            'lineas' => $this->lineas(),
            'semilleros' => Semillero::orderBy('orden')->get(),
            'contenido' => ContenidoInvestigacion::first(),
        ];
    }

    public function proyectos(): Collection
    {
        return Proyecto::with(['linea', 'autor'])->orderByDesc('gestion')->latest('updated_at')->latest('id')->get();
    }

    public function lineas(): Collection
    {
        return Linea::withCount('proyectos')->orderBy('orden')->get();
    }

    public function crearProyecto(array $datos, User $usuario): Proyecto
    {
        $proyecto = Proyecto::create([...$datos, 'user_id' => $usuario->id]);

        $this->bitacora->accion($usuario, 'crear', $proyecto, $proyecto->titulo);

        return $proyecto->load(['linea', 'autor']);
    }

    public function actualizarProyecto(Proyecto $proyecto, array $datos, User $usuario): Proyecto
    {
        $proyecto->update([...$datos, 'user_id' => $usuario->id]);

        $this->bitacora->accion($usuario, 'editar', $proyecto, $proyecto->titulo);

        return $proyecto->load(['linea', 'autor']);
    }

    /** Publicar u ocultar no cambia el contenido: no toca la fecha de actualización. */
    public function cambiarPublicacion(Proyecto $proyecto, bool $publicado, User $usuario): Proyecto
    {
        if ($proyecto->publicado !== $publicado) {
            $proyecto->timestamps = false;
            $proyecto->update(['publicado' => $publicado]);
            $proyecto->timestamps = true;

            $this->bitacora->accion($usuario, $publicado ? 'publicar' : 'ocultar', $proyecto, $proyecto->titulo);
        }

        return $proyecto->load(['linea', 'autor']);
    }

    public function eliminarProyecto(Proyecto $proyecto, User $usuario): void
    {
        $proyecto->delete();

        $this->bitacora->accion($usuario, 'eliminar', 'Proyecto #'.$proyecto->id, $proyecto->titulo);
    }

    /**
     * Guarda la lista completa de líneas conservando el id de las que ya existían
     * (los proyectos apuntan a ellas). Una línea con proyectos no se puede quitar.
     */
    public function guardarLineas(array $lineas, User $usuario): Collection
    {
        DB::transaction(function () use ($lineas) {
            $quedan = collect($lineas)->pluck('id')->filter()->all();
            $quitadas = Linea::whereNotIn('id', $quedan)->withCount('proyectos')->get();
            $enUso = $quitadas->firstWhere('proyectos_count', '>', 0);

            if ($enUso) {
                $cantidad = $enUso->proyectos_count === 1 ? '1 proyecto' : "{$enUso->proyectos_count} proyectos";

                throw ValidationException::withMessages([
                    'lineas' => "No se puede quitar «{$enUso->nombre}»: tiene {$cantidad}. Primero cámbielos de línea.",
                ]);
            }

            Linea::whereKey($quitadas->modelKeys())->delete();

            foreach (array_values($lineas) as $orden => $fila) {
                $datos = ['nombre' => $fila['nombre'], 'descripcion' => $fila['descripcion'], 'orden' => $orden];

                empty($fila['id'])
                    ? Linea::create($datos)
                    : Linea::whereKey($fila['id'])->update($datos);
            }
        });

        $this->bitacora->accion($usuario, 'editar', 'Investigación: líneas de investigación');

        return $this->lineas();
    }

    public function guardarComplementos(array $contenido, array $semilleros, User $usuario): void
    {
        DB::transaction(function () use ($contenido, $semilleros) {
            (ContenidoInvestigacion::first() ?? new ContenidoInvestigacion)->fill($contenido)->save();

            Semillero::query()->delete();
            foreach (array_values($semilleros) as $orden => $semillero) {
                Semillero::create([...$semillero, 'orden' => $orden]);
            }
        });

        $this->bitacora->accion($usuario, 'editar', 'Investigación: semilleros y PIA');
    }
}
