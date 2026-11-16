<?php

namespace App\Modulos\Contacto;

use App\Http\Controllers\Controller as BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class Controller extends BaseController
{
    /**
     * Devuelve todos los mensajes de contacto ordenados del más reciente al más antiguo.
     */
    public function index(): JsonResponse
    {
        $mensajes = MensajeContacto::query()
            ->orderByDesc('id')
            ->get();

        return response()->json($mensajes);
    }

    /**
     * Actualiza el estado del mensaje a atendido y guarda una nota/respuesta.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'atendido' => ['sometimes', 'boolean'],
            'respuesta' => ['nullable', 'string', 'max:5000'],
            'estado' => ['nullable', 'string', 'max:50'],
        ], [
            'respuesta.max' => 'La respuesta o nota no puede superar los 5000 caracteres.',
        ]);

        $mensaje = MensajeContacto::findOrFail($id);

        $atendido = $request->has('atendido') ? $request->boolean('atendido') : true;
        $respuesta = $request->has('respuesta') ? $request->input('respuesta') : $mensaje->respuesta;
        $estado = $request->input('estado', $atendido ? MensajeContacto::ATENDIDO : MensajeContacto::NUEVO);

        $mensaje->update([
            'atendido' => $atendido,
            'respuesta' => $respuesta,
            'estado' => $estado,
            'atendido_en' => $atendido ? ($mensaje->atendido_en ?? now()) : null,
        ]);

        return response()->json([
            'mensaje' => 'Mensaje de contacto actualizado exitosamente.',
            'datos' => $mensaje,
            'data' => $mensaje,
        ]);
    }
}
