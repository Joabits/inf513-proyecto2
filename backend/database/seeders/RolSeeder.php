<?php

namespace Database\Seeders;

use App\Models\Rol;
use Illuminate\Database\Seeder;

class RolSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [Rol::DIRECTOR, 'Director de Carrera', 'Administra usuarios, bitácora, estadísticas y supervisa todo el portal.'],
            [Rol::EDITOR_INSTITUCIONAL, 'Editor Institucional', 'Gestiona la información institucional, académica, de investigación y vinculación.'],
            [Rol::EDITOR_COMUNICACION, 'Editor de Comunicación', 'Gestiona noticias, eventos, galería y mensajes de contacto.'],
            [Rol::USUARIO, 'Usuario', 'Visitante registrado (por ejemplo, un graduado).'],
        ];

        foreach ($roles as [$slug, $nombre, $descripcion]) {
            Rol::updateOrCreate(['slug' => $slug], compact('nombre', 'descripcion'));
        }
    }
}
