# Módulos (Screaming Architecture + Vertical Slices)

Cada carpeta es una funcionalidad del portal y contiene todo lo suyo:

```
modulos/<modulo>/
├── api.ts                ← llamadas a /api/<modulo> con `cliente`
├── tipos.ts              ← tipos iguales al Resource de Laravel
├── <modulo>.esquema.ts   ← validación Zod con mensajes en español
├── use<Modulo>.ts        ← hooks de TanStack Query
├── componentes/
├── paginas/              ← públicas y de gestión
├── rutas.tsx             ← rutas del módulo (las de gestión con <RutaProtegida roles={[...]}>)
└── index.ts              ← lo único que se exporta (las rutas y los tipos públicos)
```

Reglas:
1. Un módulo no importa nada de otro módulo. Lo común va a `src/compartido/`.
2. Colores solo con las clases del tema (`bg-fondo`, `text-texto`, `bg-primario`, `text-acento`,
   `text-titulo`, `bg-marino`, `border-borde`, `rounded-tema`...). Nunca `bg-red-600` ni `#DE1D2A` sueltos.
3. Para registrar el módulo, agregar sus rutas en `src/app/rutas.tsx`.

Ejemplo completo de un módulo: `~/tecno-web/ejemplo-arquitecturas/2-recomendada`.
