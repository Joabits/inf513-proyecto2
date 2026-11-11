<?php

namespace App\Modulos\Documentos;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Sirve para crear y para editar. Al editar, el archivo es opcional: si llega, reemplaza al actual.
 * Se valida el tipo real del contenido (mimes) y también la extensión, para que un archivo
 * de otro tipo renombrado a .pdf no pase.
 */
class GuardarDocumentoRequest extends FormRequest
{
    public const TIPOS = ['pdf', 'xlsx'];

    public const MAXIMO_KB = 10240;

    public function rules(): array
    {
        $creando = $this->route('documento') === null;

        return [
            'titulo' => ['required', 'string', 'max:160'],
            'descripcion' => ['nullable', 'string', 'max:300'],
            'categoria' => ['required', 'string', 'max:60'],
            'publicado' => ['required', 'boolean'],
            'archivo' => [
                $creando ? 'required' : 'nullable',
                'file',
                'mimes:'.implode(',', self::TIPOS),
                'extensions:'.implode(',', self::TIPOS),
                'max:'.self::MAXIMO_KB,
            ],
        ];
    }

    public function attributes(): array
    {
        return ['titulo' => 'título', 'descripcion' => 'descripción', 'categoria' => 'categoría'];
    }

    public function messages(): array
    {
        return [
            'archivo.required' => 'Elija el archivo del documento.',
            'archivo.mimes' => 'El archivo debe ser PDF o Excel (.xlsx).',
            'archivo.extensions' => 'El archivo debe ser PDF o Excel (.xlsx).',
            'archivo.max' => 'El archivo no debe pesar más de 10 MB.',
        ];
    }

    /** Los textos llegan en un formulario con archivo: se limpian antes de validar. */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'titulo' => trim((string) $this->input('titulo')),
            'categoria' => trim((string) $this->input('categoria')),
            'descripcion' => trim((string) $this->input('descripcion')) ?: null,
        ]);
    }
}
