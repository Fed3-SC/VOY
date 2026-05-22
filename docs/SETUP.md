# Configuración e Instalación del Proyecto VOY

Esta guía te ayudará a levantar la aplicación completa (Frontend + Backend + Base de Datos).

## Requisitos Previos

- Node.js (v18 o superior)
- Cuenta en [Supabase](https://supabase.com/) (Free Tier es suficiente) o una instancia local de PostgreSQL
- Git

---

## 1. Configuración de la Base de Datos (Supabase)

1. Ingresá a [supabase.com](https://supabase.com) y creá un nuevo proyecto.
2. Anotá la contraseña de la base de datos que elijas.
3. En el panel izquierdo de Supabase, andá a **SQL Editor**.
4. Abrí el archivo local `database/001_schema.sql`, copiá su contenido, pegalo en el SQL Editor y dale a **Run**.
5. Hacé lo mismo con el archivo `database/002_seed.sql`. Vas a ver un mensaje indicando que se generaron los viajes correctamente.

**Obtener la URL de conexión:**
- En Supabase, andá a **Project Settings** (el engranaje abajo a la izquierda) > **Database**.
- Buscá la sección **Connection string** y elegí **URI**.
- Debería verse algo así: `postgresql://postgres.[tu-id]:[TU-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

---

## 2. Configuración del Backend

1. Abrí una terminal y navegá a la carpeta del backend:
   ```bash
   cd backend
   ```

2. Instalá las dependencias:
   ```bash
   npm install
   ```

3. Creá el archivo de variables de entorno:
   - Copiá el archivo `.env.example` y renombralo a `.env`.
   - Reemplazá `[TU-PASSWORD]` en la `DATABASE_URL` con la contraseña de tu base de datos de Supabase.
   - Opcionalmente, cambiá el `JWT_SECRET` por uno tuyo (en desarrollo cualquier string sirve).

4. Levantá el servidor:
   ```bash
   npm run dev
   ```
   *Deberías ver "✅ Conectado a PostgreSQL" y "🚌 VOY Backend corriendo en http://localhost:3001".*

---

## 3. Configuración del Frontend

1. Abrí una **nueva** terminal y navegá a la carpeta del frontend:
   ```bash
   cd frontend
   ```

2. Instalá las dependencias (si no lo hiciste antes):
   ```bash
   npm install
   ```

3. Levantá la aplicación:
   ```bash
   npm run dev
   ```
   *El frontend correrá en http://localhost:5173 y enviará las peticiones a la API automáticamente usando el proxy de Vite.*

---

## 4. Usuarios de Prueba

Gracias al script `002_seed.sql`, ya tenés viajes disponibles para probar el flujo de compra. Si necesitás un usuario para loguearte, podés registrarte desde la misma página (la contraseña se encriptará correctamente en la base de datos).

## Solución de Problemas Comunes

- **"No se pudo conectar a PostgreSQL"**: Asegurate de haber reemplazado `[TU-PASSWORD]` en la `DATABASE_URL` en el archivo `backend/.env`. En Supabase las contraseñas no llevan corchetes.
- **"Network Error" o las ciudades no cargan**: Verificá que la terminal del backend siga corriendo sin errores y que esté en el puerto 3001.
- **"Token expirado"**: Cerrá sesión y volvé a ingresar.
