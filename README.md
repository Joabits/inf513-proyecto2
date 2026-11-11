# Portal Web de la Carrera de Administración de Empresas (UAGRM) — Sistema vía Web

Proyecto 2 de Tecnología Web (INF513-SA), Grupo 17 SA.

- **Backend:** Laravel 13 (PHP 8.3+), API REST, PostgreSQL, Sanctum (sesión por cookie).
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4, TanStack Query, React Hook Form + Zod.
- **Producción:** https://www.tecnoweb.org.bo/inf513/grupo17sa/proyecto2

## Arquitectura

```
inf513-proyecto2/
├── backend/                     Laravel: MVC + capa de servicios, por módulos
│   └── app/
│       ├── Modulos/<Modulo>/    Controller, Service, Model, Request, Resource y rutas.php
│       ├── Compartido/          Middleware (rol) y servicios comunes (Bitacora)
│       └── Models/              User y Rol
└── frontend/                    React: Screaming Architecture + Vertical Slices
    └── src/
        ├── modulos/<modulo>/    api, tipos, esquema, hooks, componentes, páginas y rutas
        ├── compartido/          cliente API, tema, layout, menú, sesión, visitas, UI
        └── app/                 arranque, proveedores y rutas
```

Cada módulo es una carpeta independiente en los dos lados. Ver `frontend/src/modulos/LEEME.md`.

### Lo que ya trae la base

| Requisito | Dónde |
|---|---|
| 4 roles fijos (Director de Carrera, Editor Institucional, Editor de Comunicación, Usuario) | `RolSeeder`, `App\Models\Rol` |
| Matriz de acceso por recurso y acción (`noticias.crear`, `usuarios.eliminar`...) | tablas `permisos`, `rol_permiso`; `PermisoSeeder`; middleware `permiso:` |
| Menú dinámico en BD según los permisos del rol activo | tabla `menus` (cada opción ligada a un permiso); `GET /api/menu` |
| Bitácora: ingresos, fallidos, IP, acciones y recursos más accedidos | tabla `bitacora`; servicio `Bitacora`; middleware `RegistrarAcceso` |
| Triggers de PostgreSQL: contador de visitas y auditoría de usuarios y permisos | migración `create_triggers` |
| Contador de visitas por página en el pie | tablas `visitas` y `visitas_pagina`; `POST /api/visitas`; `Pie.tsx` |
| 3 temas (niños, jóvenes, adultos), día/noche por hora, tamaño de letra y contraste | `frontend/src/index.css`, `compartido/tema/` |
| Validación con mensajes en español | `backend/lang/es/` (servidor) y Zod en cada formulario (cliente) |
| Buscador en el header | `Cabecera.tsx` (la página de resultados es del CU-07) |
| Esquema de PostgreSQL configurable | `DB_SCHEMA` en `.env` (en el servidor, el esquema del grupo) |

### Identidad visual (Manual de uso de marca FCEE, gestión 2026)

- **Logo:** el de la FCEE (`frontend/src/compartido/marca/`). La carrera no tiene logo propio:
  el manual prohíbe crear variantes del escudo para carreras. Versión positiva sobre blanco
  y negativa (letras blancas) sobre azul.
- **Colores:** rojo `#DA0A15`, azul `#21366E`, azul oscuro `#0F1E45`, gris claro `#F4F5F7`,
  blanco y negro `#0A0A0A`. El manual no permite otras tonalidades ni degradados.
- **Tipografía:** Montserrat (incluida en el proyecto, no depende de Internet).
- En los componentes se usan solo las clases del tema (`bg-fondo`, `text-texto`, `text-titulo`,
  `bg-primario`, `text-acento`, `bg-marino`, `bg-marino-oscuro`, `border-borde`, `rounded-tema`).

## Puesta en marcha (desarrollo)

Requisitos: PHP 8.3+ con `pdo_pgsql`, Composer, Node 22+, PostgreSQL.

```bash
# 1. Backend
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Editar .env: DB_DATABASE, DB_USERNAME y DB_PASSWORD
createdb cae_portal            # o crear la base desde pgAdmin
php artisan migrate --seed
php artisan serve              # http://localhost:8000

# 2. Frontend (otra terminal)
cd frontend
npm install
npm run dev                    # http://localhost:5173  (reenvía /api a Laravel)
```

Usuarios de prueba que crea el seeder: `director@cae.test`, `institucional@cae.test`,
`comunicacion@cae.test` y `usuario@cae.test`. Su contraseña está en
`backend/database/seeders/UsuarioPruebaSeeder.php`.

Pruebas del backend: `cd backend && php artisan test`.

## Compilar para el servidor

```bash
cd frontend && npm run build   # genera backend/public/spa con rutas /inf513/grupo17sa/proyecto2
```

Laravel sirve la aplicación React en cualquier ruta que no sea `/api`.

## Cómo trabajar en equipo

1. Cada integrante trabaja en su propia rama: `git switch -c cu-27-institucional`.
2. Un módulo por carpeta: `backend/app/Modulos/Institucional` y `frontend/src/modulos/institucional`.
3. Las migraciones nuevas van con la fecha actual en el nombre, para que no choquen.
4. Al terminar, se sube la rama y se abre un *pull request* hacia `main`.
