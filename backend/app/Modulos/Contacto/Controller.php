<?php

namespace App\Modulos\Contacto;

use App\Compartido\Servicios\Bitacora;
use App\Http\Controllers\Controller as BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/** CU-25 Atender mensajes de contacto (panel). */
class Controller extends BaseController
{
    public function __construct(private Bitacora $bitacora) {}

    /** Todos los mensajes, del más reciente al más antiguo. */
    public function index(): JsonResponse
    {
        return response()->json(MensajeContacto::query()->orderByDesc('id')->get());
    }

    /**
     * Marca el mensaje como atendido (con la nota de lo que se respondió) o lo devuelve a pendiente.
     * El estado solo puede ser «nuevo» o «atendido»: antes aceptaba cualquier texto.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'atendido' => ['sometimes', 'boolean'],
            'respuesta' => ['nullable', 'string', 'max:5000'],
            'estado' => ['nullable', 'string', Rule::in([MensajeContacto::NUEVO, MensajeContacto::ATENDIDO])],
        ], [
            'respuesta.max' => 'La respuesta o nota no puede superar los 5000 caracteres.',
            'estado.in' => 'El estado debe ser «nuevo» o «atendido».',
        ]);

        $mensaje = MensajeContacto::findOrFail($id);
        $antes = $mensaje->getAttributes();

        $atendido = $request->has('atendido')
            ? $request->boolean('atendido')
            : $request->input('estado', MensajeContacto::ATENDIDO) === MensajeContacto::ATENDIDO;

        $mensaje->update([
            'respuesta' => $request->has('respuesta') ? $request->input('respuesta') : $mensaje->respuesta,
            'estado' => $atendido ? MensajeContacto::ATENDIDO : MensajeContacto::NUEVO,
            'atendido_por' => $atendido ? ($mensaje->atendido_por ?? $request->user()->id) : null,
            'atendido_en' => $atendido ? ($mensaje->atendido_en ?? now()) : null,
        ]);

        $this->bitacora->accion(
            $request->user(),
            $atendido ? 'atender' : 'editar',
            "Mensaje de contacto #{$id}",
            $atendido ? "Atendido: {$mensaje->asunto}" : "Devuelto a pendiente: {$mensaje->asunto}",
            Bitacora::comparar($antes, $mensaje),
        );

        return response()->json([
            'mensaje' => $atendido ? 'Mensaje marcado como atendido.' : 'Mensaje devuelto a pendiente.',
            'datos' => $mensaje,
            'data' => $mensaje,
        ]);
    }

    /** Elimina un mensaje (por ejemplo, correo no deseado). Queda en la bitácora de quién lo borró. */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $mensaje = MensajeContacto::findOrFail($id);
        $mensaje->delete();

        $this->bitacora->accion($request->user(), 'eliminar', "Mensaje de contacto #{$id}", "{$mensaje->asunto} ({$mensaje->correo})");

        return response()->json(['mensaje' => 'Mensaje eliminado.']);
    }
}
