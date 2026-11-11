<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * Empresa Junior INNOVA.
 *  - innova y innova_servicios: lo que muestra su página (CU-22). "innova" tiene una sola fila.
 *  - innova_solicitudes: pedidos de servicio de los visitantes (CU-09) que atiende el personal (CU-23).
 *    Se guarda el nombre del servicio pedido, no su id: si después se cambia la lista de servicios,
 *    la solicitud sigue diciendo qué se pidió.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('innova', function (Blueprint $table) {
            $table->id();
            $table->text('presentacion');
            $table->text('mision')->nullable();
            $table->text('vision')->nullable();
            $table->string('correo', 120)->nullable();
            $table->boolean('recibe_solicitudes')->default(true);
            $table->timestamps();
        });

        Schema::create('innova_servicios', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 80);
            $table->string('descripcion', 300);
            $table->unsignedSmallInteger('orden')->default(0);
            $table->timestamps();
        });

        Schema::create('innova_solicitudes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 120);
            $table->string('organizacion', 160)->nullable();
            $table->string('correo', 120);
            $table->string('telefono', 40)->nullable();
            $table->string('servicio', 80)->nullable(); // null: «otro / no estoy seguro»
            $table->text('descripcion');
            $table->string('estado', 20)->default('pendiente')->index(); // pendiente, en_revision, aceptada, rechazada, finalizada
            $table->text('respuesta')->nullable(); // nota del personal: qué se respondió o se acordó
            $table->foreignId('atendida_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('atendida_en')->nullable();
            $table->string('ip', 45)->nullable();
            $table->string('navegador')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('innova_solicitudes');
        Schema::dropIfExists('innova_servicios');
        Schema::dropIfExists('innova');
    }
};
