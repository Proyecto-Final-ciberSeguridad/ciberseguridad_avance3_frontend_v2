# 03 - Especificación de la API REST

## 1. Convenciones Globales

* **Base URL:** `http://localhost:8080/api` (o vía variable de entorno `VITE_API_URL`).
* **Formato de intercambio:** `application/json; charset=utf-8`.
* **Autenticación:** Cabecera HTTP `Authorization: Bearer <token_hex>`.
* **Estructura de error unificada:**
  ```json
  {
    "error": "Mensaje descriptivo del error en español."
  }
  ```

---

## 2. Endpoints de Autenticación y Cuentas

### `POST /api/auth/register`
Registra un nuevo agente provincial en la plataforma.
* **Request:**
  ```json
  {
    "fullName": "Micaela Assenza",
    "dni": "39123456",
    "email": "agente@santafe.gov.ar",
    "password": "Password123"
  }
  ```
* **Validaciones:**
  * `email` debe terminar obligatoriamente en `@santafe.gov.ar`.
  * `dni` debe contener entre 7 y 9 dígitos numéricos.
  * `password` debe tener al menos 8 caracteres.
* **Responses:**
  * `201 Created`: `{"user": {"id": "...", "fullName": "...", "dni": "...", "email": "..."}}`
  * `400 Bad Request`: Datos incompletos o inválidos.
  * `409 Conflict`: `{"error": "Ya existe una cuenta registrada con ese correo."}`

---

### `POST /api/auth/login`
Inicia sesión y emite un token de acceso criptográfico.
* **Request:**
  ```json
  {
    "email": "agente@santafe.gov.ar",
    "password": "Password123"
  }
  ```
* **Responses:**
  * `200 OK`:
    ```json
    {
      "token": "4a7b9f...",
      "user": {
        "id": "usr_...",
        "fullName": "Micaela Assenza",
        "dni": "39123456",
        "email": "agente@santafe.gov.ar"
      }
    }
    ```
  * `401 Unauthorized`: `{"error": "Correo o contraseña incorrectos."}`
  * `503 Service Unavailable`: Base de datos no disponible temporalmente.

---

### `POST /api/auth/logout`
Invalida la sesión activa en el backend.
* **Headers:** `Authorization: Bearer <token>`
* **Responses:** `200 OK` `{"message": "Sesión cerrada correctamente."}`

---

### `GET /api/auth/me`
Valida la sesión y retorna los datos del agente autenticado.
* **Headers:** `Authorization: Bearer <token>`
* **Responses:**
  * `200 OK`: `{"user": { ... }}`
  * `401 Unauthorized`: Token ausente, inválido o expirado.

---

### `POST /api/auth/forgot-password`
Inicia el flujo de recuperación de contraseña generando un token temporal (TTL: 30 min).
* **Request:** `{"email": "agente@santafe.gov.ar"}`
* **Responses:**
  * `200 OK`:
    ```json
    {
      "message": "Si el correo está registrado, recibirás un enlace de recuperación.",
      "devResetUrl": "http://localhost:5173/restablecer-contrasena?token=..."
    }
    ```
  *(Nota: `devResetUrl` solo se expone en entorno `APP_ENV=development`).*

---

### `POST /api/auth/reset-password`
Establece una nueva contraseña validando el token de recuperación.
* **Request:**
  ```json
  {
    "token": "token_hex_aqui",
    "password": "NuevaPassword123"
  }
  ```
* **Responses:**
  * `200 OK`: `{"message": "Contraseña restablecida correctamente."}`
  * `400 Bad Request`: Token inválido, expirado o contraseña menor a 8 caracteres.

---

## 3. Endpoints de Progreso y Evaluación

### `GET /api/progress`
Obtiene el mapa de progreso completo del usuario para los 4 módulos.
* **Headers:** `Authorization: Bearer <token>`
* **Responses:** `200 OK`
  ```json
  {
    "progress": {
      "1": { "teoria": true, "video": true, "actividad": true, "evaluacion": true },
      "2": { "teoria_2a": true, "teoria_2b": false, ... }
    }
  }
  ```

---

### `GET /api/training-summary`
Retorna el resumen consolidado de progreso, puntajes y evaluaciones.
* **Headers:** `Authorization: Bearer <token>`
* **Responses:** `200 OK`
  ```json
  {
    "progress": { ... },
    "evaluations": {
      "1": { "score": 6, "total": 6, "percentage": 100, "updatedAt": "2026-11-03T20:00:00Z" }
    }
  }
  ```

---

### `PUT /api/progress/{module}/{resource}`
Registra la finalización de un recurso específico.
* **Headers:** `Authorization: Bearer <token>`
* **Request Body:** `{"completed": true}`
* **Parámetros:** `{module}` (1 a 4), `{resource}` (ej. `teoria`, `video`, `actividad`, `evaluacion`).
* **Responses:**
  * `200 OK`: `{"saved": true}`
  * `400 Bad Request`: Módulo fuera de rango (1-4).

---

### `POST /api/evaluations/{module}`
Almacena el resultado y las respuestas de la evaluación de un módulo.
* **Headers:** `Authorization: Bearer <token>`
* **Request:**
  ```json
  {
    "score": 6,
    "total": 6,
    "answers": [0, 2, 1, 3, 0, 1]
  }
  ```
* **Efecto secundario:** Marca automáticamente el recurso `evaluacion` como completado en `training_progress`.
* **Responses:** `200 OK` `{"saved": true}`

---

## 4. Endpoints de Certificación y Verificación

### `GET /api/certificate/status`
Consulta la disponibilidad del certificado de finalización verificando los 4 módulos.
* **Headers:** `Authorization: Bearer <token>`
* **Responses:** `200 OK`
  ```json
  {
    "available": false,
    "completedModules": 1,
    "totalModules": 4,
    "completionDate": null,
    "modules": [
      { "id": 1, "title": "Introducción a la Seguridad Digital", "completed": true, "completedResources": 4, "totalResources": 4 },
      { "id": 2, "title": "Identificación de Riesgos", "completed": false, "completedResources": 0, "totalResources": 9 },
      { "id": 3, "title": "Detección y respuesta ante incidentes", "completed": false, "completedResources": 0, "totalResources": 4 },
      { "id": 4, "title": "Cierre y Verificación", "completed": false, "completedResources": 0, "totalResources": 4 }
    ]
  }
  ```

---

### `GET /api/certificate/pdf`
Descarga el certificado oficial de finalización en formato binario PDF.
* **Headers:** `Authorization: Bearer <token>`
* **Responses:**
  * `200 OK`: `Content-Type: application/pdf; Content-Disposition: attachment; filename="certificado-santa-fe-capacita.pdf"`
  * `403 Forbidden`: `{"error": "El certificado todavía no está disponible. Completá los cuatro módulos para habilitarlo."}`
  * `401 Unauthorized`: No autenticado.

---

### `GET /api/health`
Monitoreo de estado de la API.
* **Responses:** `200 OK` `{"status": "ok"}`
