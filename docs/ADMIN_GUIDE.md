# VOY — Guía de Administración

## ¿Cómo funciona el sistema de roles?

VOY utiliza un campo `is_admin` en la tabla `users` de la base de datos para determinar si un usuario tiene permisos de administrador.

- `is_admin = FALSE` → Usuario normal (por defecto al registrarse)
- `is_admin = TRUE` → Administrador con acceso al panel de gestión

---

## Designar el primer administrador

El primer administrador debe ser designado **manualmente** desde la base de datos, ya que no existe un admin previo que pueda otorgar permisos.

### Opción 1: Desde el SQL Editor de Supabase

1. Ir a **Supabase Dashboard** → Tu proyecto → **SQL Editor**
2. Ejecutar el siguiente comando (reemplazando con el email del usuario):

```sql
UPDATE users SET is_admin = TRUE WHERE email = 'tu-email@ejemplo.com';
```

3. El usuario debe **cerrar sesión y volver a iniciar sesión** para que el token JWT incluya los permisos actualizados.

### Opción 2: Desde la terminal con `psql`

```bash
psql -h <SUPABASE_HOST> -U postgres -d postgres -c "UPDATE users SET is_admin = TRUE WHERE email = 'tu-email@ejemplo.com';"
```

---

## Promover otros usuarios a administrador (desde la app)

Una vez que tengas un administrador, este puede promover a otros usuarios **directamente desde la aplicación web**:

1. Iniciar sesión como administrador
2. Ir a `/admin` (Panel de Administración)
3. Hacer clic en **👥 Usuarios**
4. En la tabla de usuarios, buscar al usuario que querés promover
5. Hacer clic en el botón **⭐ Hacer admin** en la columna "Acciones"
6. Confirmar la acción en el modal de confirmación

### Quitar permisos de administrador

Desde la misma pantalla de usuarios (`/admin/users`):

1. Localizar al usuario con permisos de admin
2. Hacer clic en **🔽 Quitar admin**
3. Confirmar la acción

> **Nota de seguridad:** Un administrador **no puede quitarse los permisos a sí mismo** desde la aplicación. Esto es una protección para evitar dejar el sistema sin administradores.

---

## Protección de rutas de administración

### Frontend
- Las rutas `/admin`, `/admin/users` y `/admin/features` están protegidas con un componente `ProtectedAdminRoute`
- Si un usuario no autenticado intenta acceder → es redirigido a `/auth` (inicio de sesión)
- Si un usuario autenticado sin permisos de admin intenta acceder → es redirigido a `/` (inicio)

### Backend (API)
- Los endpoints de escritura (POST, PUT, DELETE) en `/api/trips`, `/api/features` y `/api/users` requieren autenticación y permisos de administrador
- Se utilizan los middlewares `requireAuth` y `requireAdmin` en las rutas protegidas
- Si alguien intenta acceder sin permisos, recibe un error `403 Forbidden`

---

## Resumen de permisos

| Acción | Usuario normal | Administrador |
|--------|---------------|---------------|
| Buscar viajes | ✅ | ✅ |
| Ver características del viaje | ✅ | ✅ |
| Reservar pasajes | ✅ | ✅ |
| Acceder a `/admin` | ❌ (redirige a `/`) | ✅ |
| Crear/editar/eliminar viajes | ❌ | ✅ |
| Administrar características | ❌ | ✅ |
| Promover/quitar admin a otros | ❌ | ✅ |
| Listar todos los usuarios | ❌ | ✅ |

---

## Troubleshooting

### "No me aparece el panel de administración"
- Verificá que tu usuario tenga `is_admin = TRUE` en la base de datos
- Cerrá sesión y volvé a iniciar sesión para que se actualice el token JWT

### "Cambié los permisos en la BD pero no funciona"
- El token JWT se genera al momento del login. Después de modificar `is_admin` en la BD, el usuario debe volver a iniciar sesión

### "No puedo acceder a la API como admin"
- Verificá que estás enviando el header `Authorization: Bearer <token>`
- El token debe haberse generado **después** de que el usuario fue promovido a admin
