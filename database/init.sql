CREATE DATABASE IF NOT EXISTS sistema_prestamos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistema_prestamos;

CREATE TABLE usuarios (
    id_usuario INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cedula CHAR(8) NOT NULL UNIQUE,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('docente', 'alumno', 'encargado') NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE = InnoDB;

CREATE TABLE prioridades (
    id_prioridad TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL UNIQUE
) ENGINE = InnoDB;

CREATE TABLE estados (
    id_estado TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE
) ENGINE = InnoDB;

CREATE TABLE prestamos (
    id_prestamo INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    motivo_prestamo TEXT NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dispositivo ENUM(
        'Laptop Ceibal 01',
        'Laptop Ceibal 02',
        'Proyector Epson',
        'Tablet',
        'Cámara digital',
        'Kit de Robótica'
    ) NULL,
    id_usuario INT UNSIGNED NOT NULL,
    id_estado TINYINT UNSIGNED NOT NULL,
    id_prioridad TINYINT UNSIGNED NOT NULL,

    CONSTRAINT fk_prestamo_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_prestamo_estado
        FOREIGN KEY (id_estado)
        REFERENCES estados(id_estado)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_prestamo_prioridad
        FOREIGN KEY (id_prioridad)
        REFERENCES prioridades(id_prioridad)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    INDEX idx_prestamo_fecha (fecha),
    INDEX idx_prestamo_estado_fecha (id_estado, fecha),
    INDEX idx_prestamo_prioridad_fecha (id_prioridad, fecha),
    INDEX idx_prestamo_usuario_fecha (id_usuario, fecha)
) ENGINE = InnoDB;

INSERT INTO `prioridades` (`id_prioridad`, `nombre`) VALUES
(1, 'Baja'),
(2, 'Media'),
(3, 'Alta'),
(4, 'Urgente');

INSERT INTO `estados` (`id_estado`, `nombre`) VALUES
(1, 'Solicitado'),
(2, 'Entregado'),
(3, 'Devuelto'),
(4, 'Rechazado');


INSERT INTO `usuarios` (`cedula`, `usuario`, `password_hash`, `rol`, `activo`) VALUES
('11111111', 'paquito', '1234', 'encargado', 1),
('22222222', 'docente1', '1234', 'docente', 1),
('33333333', 'alumno1', '1234', 'alumno', 1);