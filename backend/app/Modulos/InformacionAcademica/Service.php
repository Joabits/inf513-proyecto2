<?php

namespace App\Modulos\InformacionAcademica;

class Service
{
    public function obtener(): ?Model
    {
        return Model::with('autor')->first();
    }

    public function actualizar(array $datos, int $userId): Model
    {
        $registro = Model::first();

        if ($registro) {
            $registro->update([
                'mision' => $datos['mision'],
                'vision' => $datos['vision'],
                'perfil_profesional' => $datos['perfil_profesional'],
                'objetivos' => $datos['objetivos'],
                'user_id' => $userId,
            ]);
            $registro->load('autor');

            return $registro;
        }

        $nuevo = Model::create([
            'mision' => $datos['mision'],
            'vision' => $datos['vision'],
            'perfil_profesional' => $datos['perfil_profesional'],
            'objetivos' => $datos['objetivos'],
            'user_id' => $userId,
        ]);
        $nuevo->load('autor');

        return $nuevo;
    }
}
