<?php

namespace App\Modulos\Visitas;

use Illuminate\Database\Eloquent\Model;

class VisitaPagina extends Model
{
    protected $table = 'visitas_pagina';
    protected $fillable = ['pagina', 'total'];
}
