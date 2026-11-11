# 📦 Sistema de Gestión de Préstamos de Equipos Tecnológicos

Un sistema web institucional completo, moderno y optimizado, diseñado para administrar, solicitar y realizar el seguimiento integral de préstamos de hardware educativo (laptops Ceibal, proyectores, kits de robótica, tablets, cámaras) entre usuarios (**Docentes** y **Alumnos**) y el personal administrador (**Encargado**).

---

## 🚀 Tecnologías Utilizadas

* **Backend:** PHP 8.3 (Arquitectura orientada a objetos basada en Controllers, Services, Models y Middleware con manejo de sesiones nativas).
* **Base de Datos:** MySQL 8.0 (Esquema relacional normalizado con llaves foráneas, restricciones de integridad y tipos ENUM).
* **Infraestructura:** Docker & Docker Compose (Despliegue multi-contenedor aislado para PHP, MySQL y volumen de datos persistente).
* **Administración DB:** phpMyAdmin (Interfaz web para gestión directa del servidor MySQL).
* **Frontend:** HTML5, CSS3 minimalista y JavaScript Vanilla en formato es6 (Consumo asíncrono con Fetch API, sin librerías pesadas).

---

## 📋 Características Principales

* **Autenticación Multi-Rol:** Inicio de sesión seguro con control de acceso contextual para tres roles distintos: `docente`, `alumno` y `encargado`.
* **Gestión de Solicitudes:** Los docentes y alumnos pueden registrar motivos de préstamo, seleccionar dispositivos específicos y asignar niveles de prioridad.
* **Control de Inventario y Estados:** El encargado cuenta con paneles para aprobar, rechazar, marcar entregas o finalizar solicitudes recibidas.
* **Seguridad y Persistencia:** Manejo estricto de sesiones mediante `AuthService`, cookies HTTP-Only y persistencia completa en el volumen de datos Docker.

---

## 📊 Estructura de la Base de Datos (`sistema_prestamos`)

La base de datos se inicializa automáticamente al arrancar el contenedor MySQL mediante el script `database/init.sql`.

### Tablas Principales:
1. **`usuarios`**: Contiene la información de acceso, número de cédula, estado (`activo`), contraseña hash y el rol asignado (`encargado`, `docente`, `alumno`).
2. **`prioridades`**: Catálogo que parametriza la urgencia de la solicitud (`Baja`, `Media`, `Alta`, `Urgente`).
3. **`estados`**: Catálogo con el ciclo de vida del préstamo (`Solicitado`, `Entregado`, `Devuelto`, `Rechazado`).
4. **`prestamos`**: Tabla transaccional que consolida la solicitud vinculando usuario, dispositivo seleccionado (`ENUM`), prioridad, estado actual y fechas de registro.

---

## ⚙️ Requisitos Previos

Asegúrate de contar con los siguientes elementos instalados en tu sistema antes de iniciar:

* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (o Docker Engine en Linux).
* [Docker Compose](https://docs.docker.com/compose/) v2+.

---

## 🛠️ Instalación y Despliegue Rápido

Sigue estos pasos para poner en marcha el sistema en tu entorno local:

1. **Clonar o descargar el proyecto:**
   ```bash
   git clone <url-del-repositorio>
   cd PROYECTO-PRESTAMOS
   ```

2. **Verificar el archivo de entorno (`.env`):**
   Asegúrate de tener un archivo `.env` configurado en la raíz con las credenciales básicas:
   ```env
   DB_HOST=mysql
   DB_NAME=sistema_prestamos
   DB_USER=root
   DB_PASSWORD=root
   ```

3. **Construir y levantar los servicios con Docker Compose:**
   Ejecuta el siguiente comando para reiniciar volúmenes limpios y compilar los contenedores:
   ```bash
   docker compose down -v
   docker compose up --build -d
   ```

4. **Acceso a la aplicación:**
   * **Aplicación Web:** [http://localhost:3000](http://localhost:3000)
   * **API Backend:** [http://localhost:8000/api](http://localhost:8000/api)
   * **phpMyAdmin:** [http://localhost:8080](http://localhost:8080)

---

## 🔑 Credenciales de Acceso Predeterminadas

Para pruebas inmediatas, el script `init.sql` crea los siguientes usuarios por defecto:

| Rol | Usuario | Contraseña | Vista asignada |
| :--- | :--- | :--- | :--- |
| **Encargado** | `paquito` | `1234` | `templates/encargado.html` |
| **Docente** | `docente1` | `1234` | `templates/docente.html` |
| **Alumno** | `alumno1` | `1234` | `templates/alumno.html` |

---

## 🛡️ Análisis de Riesgos y Mitigación

| Riesgo Identificado | Impacto | Plan de Mitigación / Acción |
| :--- | :---: | :--- |
| **Alta demanda simultánea y escasez de equipos tecnológicos** | **Alto** | Configuración de un sistema de prioridades estandarizado y actualización del catálogo de inventario en tiempo real. |
| **Resistencia o falta de adopción de la plataforma digital** | **Medio** | Diseño de interfaz ultraligera de baja fricción y flujo simplificado de solicitud de equipos en 3 pasos. |
| **Extravío, daño o demora en la devolución de dispositivos** | **Alto** | Trazabilidad estricta de estados (`Entregado`, `Devuelto`, `Rechazado`) asociando el responsable de la solicitud. |

---

## 📁 Estructura del Proyecto

```text
PROYECTO-PRESTAMOS/
├── Backend/
│   ├── src/
│   │   ├── Controllers/   # Controladores (AuthController, PrestamoController, etc.)
│   │   ├── Core/          # Conexión PDO, Router y Response HTTP
│   │   ├── middleware/    # AuthMiddleware y RolMiddleware
│   │   ├── Models/        # Modelos (Usuario, Prestamo, Estado, Prioridad)
│   │   ├── Routes/        # Definición de rutas API (api.php)
│   │   └── Services/      # Lógica de negocio (AuthService, PrestamoService)
├── database/
│   └── init.sql           # Script de creación e inicialización de la BD
├── Frontend/
│   ├── css/
│   │   └── estilos.css    # Hoja de estilos globales
│   ├── js/
│   │   ├── login.js       # Control de acceso y flujo de login
│   │   ├── docente.js     # Gestión de solicitudes (Docentes/Alumnos)
│   │   └── encargado.js   # Panel del administrador de préstamos
│   └── templates/
│       ├── alumno.html    # Panel visual de Alumnos
│       ├── docente.html   # Panel visual de Docentes
│       └── encargado.html # Panel visual de Encargados
├── docker-compose.yml     # Orquestación de contenedores Docker
├── Dockerfile             # Definición de la imagen PHP
└── README.md              # Documentación técnica del proyecto
```