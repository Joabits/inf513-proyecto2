<?php

namespace App\Modulos\Bitacora;

use App\Compartido\Servicios\Bitacora;
use App\Http\Controllers\Controller;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BitacoraController extends Controller
{
    private const COLUMNAS_CSV = ['Fecha', 'Tipo', 'Usuario', 'Nombre', 'Acción', 'Recurso', 'Detalle', 'Cambios', 'IP', 'Navegador'];

    public function __construct(private BitacoraService $servicio, private Bitacora $bitacora) {}

    public function listar(FiltrarBitacoraRequest $request)
    {
        return RegistroResource::collection($this->servicio->consultar($request->filtros()));
    }

    public function opciones()
    {
        return $this->servicio->opciones();
    }

    /**
     * CSV con los mismos filtros de la pantalla. Exportar también queda en la bitácora:
     * sacar datos del sistema es una acción que se audita.
     */
    public function exportar(FiltrarBitacoraRequest $request): StreamedResponse
    {
        $filtros = $request->filtros();
        $this->bitacora->accion($request->user(), 'exportar', 'Bitácora', $this->describir($filtros));

        $registros = $this->servicio->recorrer($filtros);

        return response()->streamDownload(function () use ($registros) {
            $salida = fopen('php://output', 'w');
            fwrite($salida, "\xEF\xBB\xBF"); // BOM: Excel abre el archivo con tildes correctas
            fputcsv($salida, self::COLUMNAS_CSV);

            foreach ($registros as $r) {
                fputcsv($salida, array_map([self::class, 'celda'], [
                    $r->created_at?->format('Y-m-d H:i:s'),
                    $r->tipo,
                    $r->usuario,
                    $r->nombre_usuario,
                    $r->accion,
                    $r->recurso,
                    $r->detalle,
                    $r->cambios ? json_encode($r->cambios, JSON_UNESCAPED_UNICODE) : null,
                    $r->ip,
                    $r->navegador,
                ]));
            }

            fclose($salida);
        }, 'bitacora_'.now()->format('Y-m-d_His').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /**
     * Una celda que empieza con = + - @ la ejecutaría Excel como fórmula (inyección CSV):
     * se antepone un apóstrofo para que quede como texto.
     */
    private static function celda(?string $valor): ?string
    {
        if ($valor !== null && $valor !== '' && in_array($valor[0], ['=', '+', '-', '@', "\t", "\r"], true)) {
            return "'".$valor;
        }

        return $valor;
    }

    private function describir(array $filtros): string
    {
        $grupo = $filtros['grupo'] ?? 'auditoria';
        $partes = [BitacoraService::GRUPOS[$grupo]['etiqueta']];
        foreach (['usuario' => 'usuario', 'accion' => 'acción', 'texto' => 'texto', 'desde' => 'desde', 'hasta' => 'hasta', 'resultado' => 'resultado'] as $clave => $nombre) {
            if (isset($filtros[$clave])) {
                $partes[] = "$nombre: {$filtros[$clave]}";
            }
        }

        return implode(' · ', $partes);
    }
}
