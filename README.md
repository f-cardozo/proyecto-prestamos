Sistema de Gestión de Préstamos de Equipos
Sistema web institucional desarrollado para la administración, solicitud y seguimiento de préstamos de equipos tecnológicos (laptops, proyectores, kits de robótica, etc.) con control de roles de usuario.

🚀 Tecnologías Utilizadas
Backend: PHP 8.3 (Arquitectura limpia basada en servicios y controladores, manejo de sesiones nativas).

Base de Datos: MySQL 8.0 (Diseño relacional normalizado con restricciones de integridad y catálogos).

Contenedores: Docker & Docker Compose (Entorno aislado para PHP y MySQL).

Administración DB: phpMyAdmin (Interfaz web integrada para gestión de bases de datos).

Frontend: HTML5, CSS3 (Diseño minimalista y funcional) y JavaScript Vanilla (Fetch API para comunicación asíncrona).

📊 Estructura de la Base de Datos (sistema_prestamos)
La base de datos se inicializa automáticamente mediante el script init.sql e incluye las siguientes tablas principales:

usuarios: Almacena las credenciales, cédula, estado de actividad y roles (docente, alumno, encargado).

prioridades: Catálogo de niveles de prioridad (Baja, Media, Alta, Urgente).

estados: Catálogo de estados del préstamo (Solicitado, Entregado, Devuelto, Rechazado).

prestamos: Tabla transaccional que registra las solicitudes de equipos vinculando usuarios, estados, prioridades y tipos de dispositivos (ENUM).

⚙️ Requisitos Previos
Docker instalado en tu equipo.

Docker Compose instalado.