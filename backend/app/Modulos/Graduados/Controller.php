<?php

namespace App\Modulos\Graduados;

use App\Compartido\Servicios\Bitacora;
use App\Http\Controllers\Controller as BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\StreamedResponse;

class Controller extends BaseController
{
    public function __construct(private Service $servicio, private Bitacora $bitacora) {}

    /** Panel (CU-18). ?buscar= filtra igual que el buscador de la pantalla. */
    public function index(HttpRequest $request): AnonymousResourceCollection
    {
        return Resource::collection($this->servicio->listar($request->query('buscar')));
    }

    /** Directorio público (/alumni): solo datos académicos, sin CI, correo ni teléfono. */
    public function listarPublicos(): AnonymousResourceCollection
    {
        return GraduadoPublicoResource::collection($this->servicio->listarPublicos());
    }

    /**
     * CU-10: un graduado solicita su cuenta desde el portal (sin sesión). La cuenta queda inactiva hasta que la
     * Carrera la apruebe en el panel (CU-18). Si llenó el campo trampa es un programa: se responde igual y no se crea nada.
     */
    public function solicitarCuenta(SolicitudCuentaRequest $request): JsonResponse
    {
        $respuesta = ['mensaje' => 'Recibimos su solicitud. La Carrera revisará sus datos y activará su cuenta; después podrá ingresar con su correo y su contraseña.'];
        if ($request->esAutomatico()) {
            return response()->json($respuesta, 201);
        }

        $graduado = $this->servicio->solicitarCuenta($request->safe()->except(SolicitudCuentaRequest::TRAMPA));
        $this->bitacora->accion($graduado->cuenta, 'solicitar', "Graduado #{$graduado->id}", $graduado->nombre_completo);

        return response()->json($respuesta, 201);
    }

    /** CU-18: la Carrera aprueba la cuenta que solicitó un graduado. */
    public function aprobarCuenta(int $id, HttpRequest $request): Resource
    {
        $graduado = $this->servicio->aprobarCuenta($id);
        $this->bitacora->accion($request->user(), 'aprobar', "Graduado #{$id}", "Cuenta de {$graduado->cuenta->email}");

        return new Resource($graduado->load('autor'));
    }

    /** CU-18: la Carrera rechaza la solicitud: se borran el registro y la cuenta que nunca se activó. */
    public function rechazarSolicitud(int $id, HttpRequest $request): JsonResponse
    {
        $graduado = $this->servicio->rechazarSolicitud($id);
        $this->bitacora->accion($request->user(), 'rechazar', "Graduado #{$id}", $graduado->nombre_completo);

        return response()->json(['mensaje' => 'Solicitud rechazada: se eliminaron el registro y la cuenta.']);
    }

    /**
     * CU-18: exporta a CSV lo que se ve en el panel (con la misma búsqueda). Lleva datos personales: exige el permiso
     * graduados.exportar y queda en la bitácora cuántos registros salieron.
     */
    public function exportarCsv(HttpRequest $request): StreamedResponse
    {
        $buscar = $request->query('buscar');
        $graduados = $this->servicio->listar($buscar);
        $nombreArchivo = 'graduados_'.date('Y-m-d').'.csv';

        $detalle = $graduados->count().' registros'.($buscar ? " con la búsqueda «{$buscar}»" : '');
        $this->bitacora->accion($request->user(), 'exportar', 'Graduados', $detalle);

        return response()->streamDownload(function () use ($graduados) {
            $salida = fopen('php://output', 'w');
            fwrite($salida, "\xEF\xBB\xBF"); // BOM UTF-8 para que Excel reconozca las tildes
            fputcsv($salida, ['Nombre', 'CI', 'Correo', 'Teléfono', 'Gestión Ingreso', 'Gestión Egreso', 'Modalidad', 'Título']);
            foreach ($graduados as $graduado) {
                fputcsv($salida, [
                    $graduado->nombre_completo,
                    $graduado->ci,
                    $graduado->correo,
                    $graduado->telefono,
                    $graduado->gestion_ingreso,
                    $graduado->gestion_egreso,
                    $graduado->modalidad,
                    $graduado->titulo_tema ?? '',
                ]);
            }
            fclose($salida);
        }, $nombreArchivo, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    public function store(Request $request): JsonResponse
    {
        $graduado = $this->servicio->crear($request->validated(), (int) $request->user()->id);
        $this->bitacora->accion($request->user(), 'crear', "Graduado #{$graduado->id}", $graduado->nombre_completo);

        return (new Resource($graduado->load('autor')))->response()->setStatusCode(201);
    }

    public function update(Request $request, int $id): Resource
    {
        $antes = Model::findOrFail($id)->getAttributes();
        $graduado = $this->servicio->actualizar($id, $request->validated());
        $this->bitacora->accion($request->user(), 'editar', "Graduado #{$id}", $graduado->nombre_completo, Bitacora::comparar($antes, $graduado));

        return new Resource($graduado->load('autor'));
    }

    public function destroy(int $id, HttpRequest $request): JsonResponse
    {
        $nombre = Model::findOrFail($id)->nombre_completo;
        $this->servicio->eliminar($id);
        $this->bitacora->accion($request->user(), 'eliminar', "Graduado #{$id}", $nombre);

        return response()->json(['mensaje' => 'Graduado eliminado correctamente']);
    }

    /** CU-10: los datos del propio graduado (rol Usuario), o data: null si todavía no los cargó. */
    public function miGraduado(HttpRequest $request): JsonResponse
    {
        $graduado = $this->servicio->deCuenta($request->user());

        return response()->json(['data' => $graduado ? new Resource($graduado) : null]);
    }

    /** CU-10: el graduado registra o actualiza sus propios datos. */
    public function guardarMiGraduado(MiGraduadoRequest $request): Resource
    {
        $antes = $this->servicio->deCuenta($request->user())?->getAttributes();
        $graduado = $this->servicio->guardarDeCuenta($request->user(), $request->validated());

        $this->bitacora->accion(
            $request->user(),
            $antes === null ? 'crear' : 'editar',
            "Graduado #{$graduado->id}",
            'Mis datos de graduado',
            $antes === null ? null : Bitacora::comparar($antes, $graduado),
        );

        return new Resource($graduado->load('autor'));
    }
}
