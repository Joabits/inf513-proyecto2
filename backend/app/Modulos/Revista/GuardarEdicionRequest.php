<?php

namespace App\Modulos\Revista;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

/**
 * Crear y editar una edición. Llega como formulario con archivos: al editar, «quitar_portada» y
 * «quitar_archivo» borran el archivo actual sin subir otro; si llega uno nuevo, reemplaza al anterior.
 */
class GuardarEdicionRequest extends FormRequest
{
    public const MAXIMO_PDF_KB = 25600;

    public const MAXIMO_PORTADA_KB = 4096;

    public function rules(): array
    {
        return [
            'volumen' => ['nullable', 'integer', 'between:1,99'],
            'numero' => ['required', 'integer', 'between:1,999'],
            'anio' => ['required', 'integer', 'between:1990,'.(now()->year + 1)],
            'titulo' => ['nullable', 'string', 'max:160'],
            'descripcion' => ['nullable', 'string', 'max:1000'],
            'publicada' => ['required', 'boolean'],
            'portada' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:'.self::MAXIMO_PORTADA_KB, 'dimensions:min_width=300,min_height=300'],
            'archivo' => ['nullable', 'file', 'mimes:pdf', 'extensions:pdf', 'max:'.self::MAXIMO_PDF_KB],
            'quitar_portada' => ['nullable', 'boolean'],
            'quitar_archivo' => ['nullable', 'boolean'],
        ];
    }

    public function attributes(): array
    {
        return ['volumen' => 'volumen', 'numero' => 'número', 'anio' => 'año', 'titulo' => 'título', 'descripcion' => 'descripción', 'portada' => 'portada', 'archivo' => 'archivo'];
    }

    public function messages(): array
    {
        return [
            'portada.image' => 'La portada debe ser una imagen JPG, PNG o WebP.',
            'portada.mimes' => 'La portada debe ser una imagen JPG, PNG o WebP.',
            'portada.max' => 'La portada no debe pesar más de 4 MB.',
            'portada.dimensions' => 'La portada debe medir al menos 300 × 300 píxeles.',
            'archivo.mimes' => 'El archivo de la edición debe ser un PDF.',
            'archivo.extensions' => 'El archivo de la edición debe ser un PDF.',
            'archivo.max' => 'El archivo no debe pesar más de 25 MB.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'volumen' => $this->filled('volumen') ? $this->input('volumen') : null,
            'titulo' => trim((string) $this->input('titulo')) ?: null,
            'descripcion' => trim((string) $this->input('descripcion')) ?: null,
        ]);
    }

    /** No puede haber dos ediciones con el mismo volumen, número y año. */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $repetida = Edicion::where('numero', $this->integer('numero'))
                    ->where('anio', $this->integer('anio'))
                    ->when($this->filled('volumen'), fn ($q) => $q->where('volumen', $this->integer('volumen')), fn ($q) => $q->whereNull('volumen'))
                    ->when($this->route('edicion'), fn ($q, $edicion) => $q->whereKeyNot($edicion->id))
                    ->exists();

                if ($repetida) {
                    $validator->errors()->add('numero', 'Ya existe una edición con ese volumen, número y año.');
                }
            },
        ];
    }
}
