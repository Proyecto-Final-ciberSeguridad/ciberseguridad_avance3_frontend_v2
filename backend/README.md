# Backend - Santa Fe Capacita

API local en Go para registro, autenticación y recuperación de contraseña.

## Endpoints implementados

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

## Seguridad implementada

- La contraseña se guarda con `bcrypt`, nunca en texto plano.
- Las sesiones usan tokens aleatorios; en PostgreSQL solo se guarda el SHA-256 del token.
- Los tokens de recuperación vencen y son de un único uso.
- Al cambiar la contraseña se cierran todas las sesiones existentes.
- La respuesta de recuperación es genérica para no revelar si un correo está registrado.

## Modo desarrollo

Mientras no haya un servicio de correo configurado, `forgot-password` devuelve `devResetUrl` **solo con `APP_ENV=development`**. Esto permite demostrar el flujo completo localmente. En producción no se debe devolver ese enlace al navegador; allí se integrará el envío por correo institucional.
