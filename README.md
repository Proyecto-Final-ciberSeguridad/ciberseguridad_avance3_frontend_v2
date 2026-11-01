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

## Avance 3 v4 — recorrido de capacitación

Se incorporó la estructura funcional completa de los cuatro módulos. El Módulo 2 mantiene una única identidad de módulo y contiene internamente los seis temas teóricos 2.a a 2.f: Phishing e Ingeniería Social, Contraseñas inseguras, Malware, Navegación Segura, Seguridad física/Clean Desk y Dispositivos externos/redes públicas.

Al completar un recurso, la aplicación registra el avance y redirige automáticamente al siguiente. Al finalizar la evaluación de un módulo se abre el módulo siguiente. En el Módulo 4, la finalización devuelve al panel principal hasta que se integre la pantalla definitiva de progreso/certificación.

El contenido definitivo de teoría, videos, actividades y evaluaciones se irá integrando sobre estas rutas sin modificar nuevamente la estructura de navegación.

## Incremento v5 — Módulo 1 completo

El Módulo 1 quedó implementado de punta a punta:

- teoría web resumida a partir del documento teórico del proyecto;
- tres infografías originales del material teórico;
- video de síntesis de aproximadamente 2 minutos;
- actividad práctica con 3 situaciones y retroalimentación inmediata;
- evaluación de 6 preguntas con resultado y revisión de respuestas;
- avance automático Teoría → Video → Actividad → Evaluación → Módulo 2;
- persistencia de progreso y resultados de evaluación en PostgreSQL.

### Migración adicional requerida

Con PostgreSQL ya instalado y la base `santa_fe_capacita` creada, ejecutar una sola vez:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -p 5432 -d santa_fe_capacita -f ".\backend\migrations\002_training_progress.sql"
```

Luego reiniciar el backend con las variables de entorno habituales y `go run ./cmd/server`.


## v6 — Mi progreso

Esta versión incorpora la pantalla funcional **Mi progreso**, basada en la maqueta de Stitch y conectada a los datos reales del usuario.

- Progreso general calculado dinámicamente.
- Los cuatro módulos tienen el mismo peso: Teoría 25 %, Video 25 %, Actividad 25 %, Evaluación 25 %.
- En el Módulo 2, el 25 % correspondiente a Teoría se distribuye entre los temas 2.a a 2.f.
- Resultado de la última evaluación por módulo consultado desde PostgreSQL.
- Última actividad registrada.
- Gamificación definida mediante puntos, indicadores de progreso, cuatro logros e hitos/próximo paso.
- Puntos: 25 por cada etapa completa; máximo 100 por módulo y 400 en toda la capacitación.
- Estado del certificado calculado a partir de los módulos completados.
- Todos los módulos permanecen habilitados; se eliminan bloqueos o prerequisitos inventados en la maqueta.

No requiere una migración adicional a PostgreSQL: utiliza las tablas creadas por `002_training_progress.sql`.

Para probarla, con frontend y backend levantados, ingresar a:

`http://localhost:5173/progreso`

El enlace **Certificado** lleva por ahora al estado del certificado dentro de Mi progreso. La pantalla independiente y la generación del PDF se implementarán en el siguiente incremento.

## Avance 3 v7 — Certificado funcional

Se incorporó una pantalla independiente `/certificado`, basada en el diseño preliminar de Stitch pero conectada al backend real.

### Estados
- **Bloqueado:** si falta al menos un recurso requerido de alguno de los cuatro módulos.
- **Habilitado:** únicamente cuando los cuatro módulos están completos.

La verificación se realiza nuevamente en el backend. El frontend por sí solo no puede habilitar ni descargar el certificado.

### PDF
El endpoint autenticado `GET /api/certificate/pdf` genera el certificado en PDF en el momento de la descarga. Incluye:
- nombre completo del usuario;
- DNI;
- nombre de la capacitación;
- los cuatro módulos completados;
- fecha real de finalización calculada a partir del progreso persistido.

No incluye firmas, autoridades, resoluciones, horas académicas ni validez administrativa no definidas en el proyecto.

### Dependencia nueva de Go
Esta versión agrega `github.com/jung-kurt/gofpdf` para generar el PDF. Después de copiar la v7 sobre el proyecto local ejecutar una vez:

```powershell
cd backend
go mod tidy
```

No requiere una migración nueva de PostgreSQL.


## Ajuste de autenticación — v8

- El login diferencia credenciales incorrectas (401) de indisponibilidad del backend/base de datos (503 o error de red).
- Una caída temporal del backend/PostgreSQL ya no elimina la sesión guardada en el navegador.
- La sesión solo se limpia cuando el backend confirma que el token es inválido o venció (401/403), al cerrar sesión o al cambiar la contraseña.
- Si el servicio no está disponible al validar una sesión existente, se muestra una pantalla de reintento y se conserva el token local.
