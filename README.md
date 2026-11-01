# Santa Fe Capacita – Avance 3 / versión funcional v3

Este incremento reemplaza la autenticación simulada con `localStorage` por una arquitectura frontend/backend preparada para persistencia real.

## Cambios principales

- El **correo institucional `@santafe.gov.ar` es la credencial de acceso**.
- Registro real mediante API.
- Login real mediante API.
- Cierre de sesión.
- Recuperación de contraseña con token temporal.
- Restablecimiento de contraseña.
- Contraseñas hasheadas con bcrypt en backend.
- PostgreSQL como persistencia de usuarios, sesiones y tokens de recuperación.
- Se conserva el recorrido del Módulo 1 construido en el incremento anterior.

## 1. Frontend

Desde la raíz del proyecto:

```powershell
npm.cmd install
npm.cmd run dev
```

Por defecto utiliza `http://localhost:8080/api`.

## 2. PostgreSQL

Crear una base llamada:

```text
santa_fe_capacita
```

Luego ejecutar el archivo:

```text
backend/migrations/001_init.sql
```

La conexión local asumida por defecto es:

```text
postgres://postgres:postgres@localhost:5432/santa_fe_capacita?sslmode=disable
```

Si tu usuario/contraseña/puerto son diferentes, definir `DATABASE_URL` antes de iniciar el backend.

## 3. Backend Go

Desde `backend`:

```powershell
go mod tidy
go run ./cmd/server
```

La API quedará en:

```text
http://localhost:8080
```

Probar:

```text
http://localhost:8080/api/health
```

Debe responder `{"status":"ok"}`.

## 4. Recuperación de contraseña en desarrollo

En el entorno local todavía no se integra un servidor de correo real. Para que la funcionalidad pueda probarse de punta a punta, el backend devuelve un `devResetUrl` únicamente si `APP_ENV=development`.

Flujo:

1. Registrarse con un correo `@santafe.gov.ar`.
2. Cerrar sesión.
3. Elegir **¿Olvidaste tu contraseña?**.
4. Ingresar el mismo correo.
5. Usar el enlace temporal mostrado en la interfaz de desarrollo.
6. Crear una nueva contraseña.
7. Volver al login e ingresar con la nueva contraseña.

Antes de una puesta en producción, ese enlace deberá enviarse por correo y no mostrarse en la respuesta HTTP.

## Regla técnica de contraseña

Este incremento utiliza un mínimo de **8 caracteres** como regla técnica de implementación. No se presenta como requisito académico previamente definido; puede modificarse si el equipo decide adoptar otra política.
