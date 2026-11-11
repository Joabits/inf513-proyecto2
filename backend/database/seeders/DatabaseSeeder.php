<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Los datos iniciales no son cambios de un usuario: los triggers no los registran en la bitácora
        if (DB::getDriverName() === 'pgsql') {
            DB::select("SELECT set_config('app.omitir_auditoria', '1', false)");
        }

        $this->call([
            RolSeeder::class,
            PermisoSeeder::class,
            MenuSeeder::class,
            UsuarioPruebaSeeder::class,
            InicioSeeder::class,
            DocumentoCategoriaSeeder::class,
            ConfiguracionSeeder::class,
            // Cada módulo agrega aquí su seeder (p. ej. InstitucionalSeeder::class)
        ]);

        if (DB::getDriverName() === 'pgsql') {
            DB::select("SELECT set_config('app.omitir_auditoria', '', false)");
        }
    }
}
