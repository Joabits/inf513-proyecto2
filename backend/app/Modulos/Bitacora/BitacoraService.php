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
        'auditoria' => ['etiqueta' => 'Cambios en el contenido', 'tipos' => ['accion', 'auditoria'], 'visible' => true],
        'sesiones' => ['etiqueta' => 'Ingresos y salidas', 'tipos' => ['ingreso_ok', 'ingreso_fallido', 'salida'], 'visible' => true],
        // Lo que un administrativo necesita saber de los accesos: quién intentó entrar a algo que no le correspondía
        'denegados' => ['etiqueta' => 'Intentos sin permiso', 'tipos' => ['acceso'], 'visible' => true],
        // Registro técnico de cada llamada del sistema: no se muestra en el panel, pero se puede consultar y exportar
        'accesos' => ['etiqueta' => 'Accesos técnicos', 'tipos' => ['acceso'], 'visible' => false],
    ];

    /**
     * Lo que se pide ver con el filtro «Solo lo importante»: lo que destruye datos o cambia quién puede hacer qué.
     * La lista es corta a propósito: si casi todo es importante, nada lo es. Lo demás se ve igual, sin filtro.
     * En «Ingresos y salidas» lo importante son los intentos fallidos de ingreso.
     */
    public const ACCIONES_IMPORTANTES = [
        'eliminar', 'eliminar_usuario', 'desactivar_usuario', 'cambiar_rol', 'asignar_permiso', 'quitar_permiso',
    ];

    public const IMPORTANCIAS = ['importantes'];

    /** Sección del panel a la que pertenece una ruta de la API, del prefijo más específico al más general. */
    private const SECCIONES = [
        'gestion/innova/solicitudes' => 'Solicitudes a INNOVA',
        'gestion/usuarios' => 'Usuarios',
        'gestion/bitacora' => 'Bitácora',
        'gestion/documentos' => 'Documentos',
        'gestion/docentes' => 'Autoridades y docentes',
        'gestion/investigacion' => 'Investigación',
        'gestion/revista' => 'Revista INNOVAR',
        'inicio' => 'Página de inicio',
        'institucional' => 'Información institucional',
        'configuracion' => 'Datos de contacto y enlaces',
        'innova' => 'Empresa Junior INNOVA',
        'perfil' => 'Mi perfil',
        'noticias' => 'Noticias',
        'eventos' => 'Eventos académicos',
        'galeria' => 'Galería multimedia',
        'vinculaciones' => 'Convenios y vinculación',
        'informacion-academica' => 'Información académica',
        'gestion/graduados' => 'Graduados',
        'mi-cuenta/graduado' => 'Mis datos de graduado',
        'contacto/mensajes' => 'Mensajes de contacto',
        'mensajes' => 'Mensajes de contacto',
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
            'grupos' => collect(self::GRUPOS)->filter(fn ($g) => $g['visible'])
                ->map(fn ($g, $clave) => ['valor' => $clave, 'etiqueta' => $g['etiqueta']])->values(),
            'resultados' => collect(self::RESULTADOS)->map(fn ($etiqueta, $clave) => ['valor' => $clave, 'etiqueta' => $etiqueta])->values(),
            'usuarios' => DB::table('bitacora')->whereNotNull('usuario')->distinct()->orderBy('usuario')->pluck('usuario'),
            'acciones' => DB::table('bitacora')->whereIn('tipo', self::GRUPOS['auditoria']['tipos'])
                ->whereNotNull('accion')->distinct()->orderBy('accion')->pluck('accion'),
        ];
    }

    /** Nombre de la sección del panel a la que apunta una ruta de la API («api/gestion/usuarios/5» → «Usuarios»), o null. */
    public static function seccionDe(?string $ruta): ?string
    {
        $ruta = preg_replace('#^api/#', '', (string) $ruta);
        foreach (self::SECCIONES as $prefijo => $nombre) {
            if ($ruta === $prefijo || str_starts_with($ruta, $prefijo.'/')) {
                return $nombre;
            }
        }

        return null;
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

        if ($grupo === 'denegados') {
            $consulta->whereIn('bitacora.detalle', ['HTTP 401', 'HTTP 403']);
        }
        if (isset($filtros['usuario'])) {
            $consulta->where('bitacora.usuario', $filtros['usuario']);
        }
        if (isset($filtros['accion'])) {
            $consulta->where('bitacora.accion', $filtros['accion']);
        }
        if (($filtros['importancia'] ?? null) === 'importantes') {
            $consulta->where(fn (Builder $q) => $q
                ->whereIn('bitacora.accion', self::ACCIONES_IMPORTANTES)
                ->orWhere('bitacora.tipo', 'ingreso_fallido'));
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
