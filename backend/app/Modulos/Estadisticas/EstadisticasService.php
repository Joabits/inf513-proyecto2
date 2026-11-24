<?php

namespace App\Modulos\Estadisticas;

use App\Modulos\Bitacora\BitacoraService;
use App\Modulos\Contacto\MensajeContacto;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Estadísticas del panel: visitas del portal, ingresos al panel, acciones del personal, secciones más usadas
 * y un resumen del contenido. Todo sale de tablas que ya existen (visitas, visitas_pagina, bitacora y las de
 * cada módulo); no guarda nada nuevo. Lo que el README llama «recursos más accedidos».
 */
class EstadisticasService
{
    public const DIAS_PERMITIDOS = [7, 30, 90];

    private const TOP = 8;

    public function resumen(int $dias): array
    {
        $hasta = CarbonImmutable::now();
        $desde = $hasta->subDays($dias - 1)->startOfDay();

        return [
            'periodo' => ['dias' => $dias, 'desde' => $desde->toDateString(), 'hasta' => $hasta->toDateString()],
            'visitas' => $this->visitas($desde, $dias),
            'ingresos' => $this->ingresos($desde),
            'acciones' => $this->acciones($desde),
            'secciones' => $this->secciones($desde),
            'contenido' => $this->contenido(),
        ];
    }

    private function visitas(CarbonImmutable $desde, int $dias): array
    {
        $enPeriodo = DB::table('visitas')->where('created_at', '>=', $desde);

        $porDia = (clone $enPeriodo)
            ->selectRaw('date(created_at) as dia, count(*) as total')
            ->groupByRaw('date(created_at)')
            ->pluck('total', 'dia');

        // Todos los días del periodo, también los que no tuvieron visitas
        $serie = collect(range(0, $dias - 1))->map(function ($i) use ($desde, $porDia) {
            $dia = $desde->addDays($i)->toDateString();

            return ['fecha' => $dia, 'total' => (int) ($porDia[$dia] ?? 0)];
        });

        return [
            'total_periodo' => (clone $enPeriodo)->count(),
            'total_historico' => (int) DB::table('visitas_pagina')->sum('total'),
            'por_dia' => $serie->values(),
            'paginas' => (clone $enPeriodo)
                ->select('pagina', DB::raw('count(*) as total'))
                ->groupBy('pagina')->orderByDesc('total')->limit(self::TOP)->get()
                ->map(fn ($f) => ['pagina' => $f->pagina, 'total' => (int) $f->total]),
        ];
    }

    private function ingresos(CarbonImmutable $desde): array
    {
        $conteo = DB::table('bitacora')->where('created_at', '>=', $desde)
            ->whereIn('tipo', ['ingreso_ok', 'ingreso_fallido'])
            ->select('tipo', DB::raw('count(*) as total'))->groupBy('tipo')->pluck('total', 'tipo');

        return ['correctos' => (int) ($conteo['ingreso_ok'] ?? 0), 'fallidos' => (int) ($conteo['ingreso_fallido'] ?? 0)];
    }

    /** Cambios hechos por el personal (crear, editar, eliminar, atender, exportar...). */
    private function acciones(CarbonImmutable $desde): array
    {
        return DB::table('bitacora')->where('created_at', '>=', $desde)->where('tipo', 'accion')->whereNotNull('accion')
            ->select('accion', DB::raw('count(*) as total'))->groupBy('accion')->orderByDesc('total')->get()
            ->map(fn ($f) => ['accion' => $f->accion, 'total' => (int) $f->total])->all();
    }

    /**
     * Secciones del panel y del portal más consultadas (accesos registrados por la bitácora), por nombre de sección.
     * Los accesos técnicos que no son de ninguna sección (sesión, menú, visitas...) no se cuentan.
     */
    private function secciones(CarbonImmutable $desde): array
    {
        return DB::table('bitacora')->where('created_at', '>=', $desde)->where('tipo', 'acceso')
            ->select('recurso', DB::raw('count(*) as total'))->groupBy('recurso')->get()
            ->filter(fn ($f) => BitacoraService::seccionDe($f->recurso) !== null)
            ->groupBy(fn ($f) => BitacoraService::seccionDe($f->recurso))
            ->map(fn ($filas, $seccion) => ['seccion' => $seccion, 'total' => (int) $filas->sum('total')])
            ->sortByDesc('total')->take(self::TOP)->values()->all();
    }

    /** Lo que hay cargado hoy en el portal y lo que espera atención. */
    private function contenido(): array
    {
        $contar = fn (string $tabla, ?callable $filtro = null) => Schema::hasTable($tabla)
            ? ($filtro ? $filtro(DB::table($tabla)) : DB::table($tabla))->count()
            : 0;

        return [
            'noticias_publicadas' => $contar('noticias', fn ($q) => $q->where('publicada', true)),
            'eventos_proximos' => $contar('eventos', fn ($q) => $q->where('publicado', true)->where('fecha_fin', '>=', now())),
            'documentos_publicados' => $contar('documentos', fn ($q) => $q->where('publicado', true)),
            'graduados' => $contar('graduados'),
            'mensajes_pendientes' => $contar('mensajes_contacto', fn ($q) => $q->where('estado', MensajeContacto::NUEVO)),
            'solicitudes_innova_pendientes' => $contar('innova_solicitudes', fn ($q) => $q->where('estado', 'pendiente')),
            'usuarios_activos' => $contar('users', fn ($q) => $q->where('activo', true)),
        ];
    }
}
