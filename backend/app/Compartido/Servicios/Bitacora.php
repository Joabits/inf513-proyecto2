<?php

namespace App\Compartido\Servicios;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Registro único de la bitácora. Desde cualquier módulo:
 *   app(Bitacora::class)->accion($usuario, 'editar', $noticia);
 * Si se pasa el modelo después de guardarlo, se registra también qué cambió (antes y después).
 * Los cambios de usuarios y permisos los registran además triggers de PostgreSQL.
 */
class Bitacora
{
    /** Nunca se copian a la bitácora, aunque cambien. Se suman los campos ocultos ($hidden) de cada modelo. */
    private const CAMPOS_PROTEGIDOS = ['password', 'remember_token', 'created_at', 'updated_at'];

    /** Un texto largo (un resumen, una descripción) se guarda recortado: basta para saber qué cambió. */
    private const LARGO_VALOR = 300;

    /**
     * @param  array<string, array{antes: mixed, despues: mixed}>|null  $cambios  si es null y $recurso es un modelo
     *                                                                       recién editado, se calculan solos
     */
    public function accion(User $usuario, string $accion, Model|string $recurso, ?string $detalle = null, ?array $cambios = null): void
    {
        $nombre = $recurso instanceof Model
            ? class_basename($recurso).' #'.$recurso->getKey()
            : $recurso;

        if ($cambios === null && $recurso instanceof Model) {
            $cambios = self::diferencias($recurso);
        }

        $this->guardar('accion', $usuario, $accion, $nombre, $detalle, $cambios);
    }

    public function ingreso(User $usuario): void
    {
        $this->guardar('ingreso_ok', $usuario);
    }

    public function ingresoFallido(string $correo): void
    {
        $this->guardar('ingreso_fallido', null, null, null, 'Correo: '.$correo);
    }

    public function salida(User $usuario): void
    {
        $this->guardar('salida', $usuario);
    }

    public function acceso(?User $usuario, string $metodo, string $recurso, int $estado): void
    {
        $this->guardar('acceso', $usuario, $metodo, $recurso, 'HTTP '.$estado);
    }

    /**
     * Qué cambió en la última edición guardada del modelo: ['campo' => ['antes' => ..., 'despues' => ...]].
     * Un modelo recién creado no tiene "antes", y uno sin cambios devuelve null.
     */
    public static function diferencias(Model $modelo): ?array
    {
        if ($modelo->wasRecentlyCreated) {
            return null;
        }

        $nuevos = Arr::except($modelo->getChanges(), [...self::CAMPOS_PROTEGIDOS, ...$modelo->getHidden()]);
        if ($nuevos === []) {
            return null;
        }

        $anteriores = $modelo->getPrevious();
        $cambios = [];
        foreach ($nuevos as $campo => $valor) {
            $cambios[$campo] = [
                'antes' => self::valor($anteriores[$campo] ?? null),
                'despues' => self::valor($valor),
            ];
        }

        return $cambios;
    }

    /**
     * Qué cambió entre los atributos de antes (getAttributes() tomado antes de editar) y el modelo después.
     * Sirve cuando el servicio devuelve el modelo recargado con fresh(), que ya no recuerda sus cambios.
     */
    public static function comparar(array $antes, Model $despues): ?array
    {
        $protegidos = [...self::CAMPOS_PROTEGIDOS, ...$despues->getHidden()];
        $cambios = [];
        foreach (Arr::except($despues->getAttributes(), $protegidos) as $campo => $valor) {
            $anterior = $antes[$campo] ?? null;
            if ((string) self::valor($anterior) !== (string) self::valor($valor)) {
                $cambios[$campo] = ['antes' => self::valor($anterior), 'despues' => self::valor($valor)];
            }
        }

        return $cambios === [] ? null : $cambios;
    }

    private static function valor(mixed $valor): mixed
    {
        if ($valor === null || is_bool($valor) || is_int($valor) || is_float($valor)) {
            return $valor;
        }

        $texto = is_scalar($valor) || $valor instanceof \Stringable ? (string) $valor : json_encode($valor, JSON_UNESCAPED_UNICODE);

        return Str::limit($texto, self::LARGO_VALOR);
    }

    private function guardar(string $tipo, ?User $usuario, ?string $accion = null, ?string $recurso = null, ?string $detalle = null, ?array $cambios = null): void
    {
        DB::table('bitacora')->insert([
            'user_id' => $usuario?->id,
            'usuario' => $usuario?->email,
            'tipo' => $tipo,
            'accion' => $accion,
            'recurso' => $recurso,
            'detalle' => $detalle,
            'cambios' => $cambios === null ? null : json_encode($cambios, JSON_UNESCAPED_UNICODE),
            'ip' => request()->ip(),
            'navegador' => substr((string) request()->userAgent(), 0, 255),
            'created_at' => now(),
        ]);
    }
}
