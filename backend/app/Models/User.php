<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'rol_id', 'activo'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $attributes = ['activo' => true];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'activo' => 'boolean',
        ];
    }

    public function rol(): BelongsTo
    {
        return $this->belongsTo(Rol::class);
    }

    /** Permisos del rol del usuario, por ejemplo ['noticias.ver', 'noticias.crear']. */
    public function permisos(): array
    {
        if (! $this->activo || ! $this->rol_id) {
            return [];
        }

        return $this->permisosCache ??= $this->rol->permisos()->pluck('slug')->all();
    }

    public function tienePermiso(string $slug): bool
    {
        return in_array($slug, $this->permisos(), true);
    }

    private ?array $permisosCache = null;
}
