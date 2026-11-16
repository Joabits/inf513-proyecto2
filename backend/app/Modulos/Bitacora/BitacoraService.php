<?php

namespace App\Modulos\Bitacora;

use App\Compartido\Busqueda\Texto;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class BitacoraService
{
    public const POR_PAGINA = 25;

    /**
     * Grupos de la consulta. La auditoría (qué hizo cada quien) es lo que se ve por defecto;
     * los accesos son cada llamada a la API y sirven sobre todo para estadísticas y para ver intentos denegados.
     */
    public const GRUPOS = [
        'auditoria' => ['etiqueta' => 'Cambios en el contenido', 'tipos' => ['accion', 'auditoria']],
        'sesiones' => ['etiqueta' => 'Ingresos y salidas', 'tipos' => ['ingreso_ok', 'ingreso_fallido', 'salida']],
        'accesos' => ['etiqueta' => 'Accesos a la API', 'tipos' => ['acceso']],
    ];

    /** Resultado de un acceso según su código HTTP (se guarda en el detalle como «HTTP 403»). */
    public const RESULTADOS = [
        'exito' => 'Correctos (2xx)',
        'denegado' => 'Denegados o sin sesión (401, 403)',
        'error' => 'Otros errores (4xx y 5xx)',
    ];

    public function consultar(array $filtros): LengthAwarePaginator
    {
        return $this->consulta($filtros)->paginate(self::POR_PAGINA)->withQueryString();
    }

    /** Para exportar: la misma consulta, recorrida de a poco para no cargar todo en memoria. */
    public function recorrer(array $filtros): \Generator
    {
        yield from $this->consulta($filtros)->reorder()->lazyByIdDesc(500, 'bitacora.id', 'id');
    }

    /** Usuarios y acciones que aparecen en la bitácora, para las listas de los filtros. */
    public function opciones(): array
    {
        return [
            'grupos' => collect(self::GRUPOS)->map(fn ($g, $clave) => ['valor' => $clave, 'etiqueta' => $g['etiqueta']])->values(),
            'resultados' => collect(self::RESULTADOS)->map(fn ($etiqueta, $clave) => ['valor' => $clave, 'etiqueta' => $etiqueta])->values(),
            'usuarios' => DB::table('bitacora')->whereNotNull('usuario')->distinct()->orderBy('usuario')->pluck('usuario'),
            'acciones' => DB::table('bitacora')->whereIn('tipo', self::GRUPOS['auditoria']['tipos'])
                ->whereNotNull('accion')->distinct()->orderBy('accion')->pluck('accion'),
        ];
    }

    private function consulta(array $filtros): Builder
    {
        $grupo = $filtros['grupo'] ?? 'auditoria';

        $consulta = Registro::query()
            ->leftJoin('users', 'users.id', '=', 'bitacora.user_id')
            ->select('bitacora.*', 'users.name as nombre_usuario')
            ->whereIn('bitacora.tipo', self::GRUPOS[$grupo]['tipos'])
            ->orderByDesc('bitacora.created_at')
            ->orderByDesc('bitacora.id');

        if (isset($filtros['usuario'])) {
            $consulta->where('bitacora.usuario', $filtros['usuario']);
        }
        if (isset($filtros['accion'])) {
            $consulta->where('bitacora.accion', $filtros['accion']);
        }
        if (isset($filtros['desde'])) {
            $consulta->where('bitacora.created_at', '>=', $filtros['desde'].' 00:00:00');
        }
        if (isset($filtros['hasta'])) {
            $consulta->where('bitacora.created_at', '<=', $filtros['hasta'].' 23:59:59');
        }
        if (isset($filtros['texto'])) {
            foreach (Texto::terminos($filtros['texto']) as $termino) {
                $consulta->where(function (Builder $alguna) use ($termino) {
                    foreach (['bitacora.recurso', 'bitacora.detalle', 'bitacora.usuario', 'users.name'] as $columna) {
                        $alguna->orWhereRaw(Texto::like($columna), [Texto::patron($termino)]);
                    }
                });
            }
        }
        if ($grupo === 'accesos' && isset($filtros['resultado'])) {
            match ($filtros['resultado']) {
                'exito' => $consulta->where('bitacora.detalle', 'like', 'HTTP 2%'),
                'denegado' => $consulta->whereIn('bitacora.detalle', ['HTTP 401', 'HTTP 403']),
                'error' => $consulta->where(fn (Builder $q) => $q
                    ->where('bitacora.detalle', 'like', 'HTTP 4%')->orWhere('bitacora.detalle', 'like', 'HTTP 5%'))
                    ->whereNotIn('bitacora.detalle', ['HTTP 401', 'HTTP 403']),
            };
        }

        return $consulta;
    }
}
