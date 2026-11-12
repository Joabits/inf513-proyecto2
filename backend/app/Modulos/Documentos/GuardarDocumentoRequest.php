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
    public const TIPOS = ['pdf', 'docx', 'xlsx'];

    /** 25 MB: alcanza para documentos escaneados. El servidor debe aceptarlo (public/.user.ini). */
    public const MAXIMO_KB = 25600;

    public function rules(): array
    {
        $creando = $this->route('documento') === null;

        return [
            'titulo' => ['required', 'string', 'max:160'],
            'descripcion' => ['nullable', 'string', 'max:300'],
            'categoria_id' => ['required', 'integer', 'exists:documento_categorias,id'],
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
        return ['titulo' => 'título', 'descripcion' => 'descripción', 'categoria_id' => 'categoría'];
    }

    public function messages(): array
    {
        return [
            'categoria_id.required' => 'Elija una categoría.',
            'archivo.required' => 'Elija el archivo del documento.',
            'archivo.uploaded' => 'El archivo no se pudo subir. Verifique que no pese más de 25 MB.',
            'archivo.mimes' => 'El archivo debe ser PDF, Word (.docx) o Excel (.xlsx).',
            'archivo.extensions' => 'El archivo debe ser PDF, Word (.docx) o Excel (.xlsx).',
            'archivo.max' => 'El archivo no debe pesar más de 25 MB.',
        ];
    }

    /** Los textos llegan en un formulario con archivo: se limpian antes de validar. */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'titulo' => trim((string) $this->input('titulo')),
            'descripcion' => trim((string) $this->input('descripcion')) ?: null,
        ]);
    }
}
