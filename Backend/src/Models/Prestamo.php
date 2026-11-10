<?php

final class Prestamo
{
    public function __construct(
        private PDO $conexion
    ) {
    }

    public function listarAbiertosPorUsuario(int $idUsuario): array 
    {
        $sql = '
            SELECT
                t.id_prestamo,
                t.motivo_prestamo,
                t.fecha,
                t.dispositivo,
                t.id_prioridad,
                p.nombre AS prioridad,
                e.nombre AS estado
            FROM prestamos AS t

            INNER JOIN prioridades AS p
                ON p.id_prioridad = t.id_prioridad

            INNER JOIN estados AS e
                ON e.id_estado = t.id_estado

            WHERE t.id_usuario = :id_usuario
              AND e.nombre = :estado

            ORDER BY t.fecha DESC
        ';

        $consulta = $this->conexion->prepare($sql);

        $consulta->execute([
            'id_usuario' => $idUsuario,
            'estado' => 'Solicitado'
        ]);

        return $consulta->fetchAll(PDO::FETCH_ASSOC);
    }

    public function buscarPorId(int $idPrestamo): ?array
    {
        $sql = '
            SELECT
                t.id_prestamo,
                t.motivo_prestamo,
                t.fecha,
                t.dispositivo,
                t.id_usuario,
                t.id_estado,
                t.id_prioridad,
                e.nombre AS estado
            FROM prestamos AS t

            INNER JOIN estados AS e
                ON e.id_estado = t.id_estado

            WHERE t.id_prestamo = :id_prestamo
        ';

        $consulta = $this->conexion->prepare($sql);

        $consulta->execute([
            'id_prestamo' => $idPrestamo
        ]);

        $prestamo = $consulta->fetch(PDO::FETCH_ASSOC);

        if ($prestamo === false) {
            return null;
        }

        return $prestamo;
    }

    public function crear(
        string $motivoPrestamo,
        ?string $dispositivo,
        int $idUsuario,
        int $idEstado,
        int $idPrioridad
    ): int {
        $sql = '
            INSERT INTO prestamos (
                motivo_prestamo,
                dispositivo,
                id_usuario,
                id_estado,
                id_prioridad
            ) VALUES (
                :motivo_prestamo,
                :dispositivo,
                :id_usuario,
                :id_estado,
                :id_prioridad
            )
        ';

        $consulta = $this->conexion->prepare($sql);

        $consulta->execute([
            'motivo_prestamo' => $motivoPrestamo,
            'dispositivo' => $dispositivo,
            'id_usuario' => $idUsuario,
            'id_estado' => $idEstado,
            'id_prioridad' => $idPrioridad
        ]);

        return (int) $this->conexion->lastInsertId();
    }

    public function actualizar(
        int $idPrestamo, 
        string $motivoPrestamo, 
        ?string $dispositivo, 
        int $idPrioridad
    ): void 
    {
        $sql = '
            UPDATE prestamos
            SET
                motivo_prestamo = :motivo_prestamo,
                dispositivo = :dispositivo,
                id_prioridad = :id_prioridad
            WHERE id_prestamo = :id_prestamo
        ';

        $consulta = $this->conexion->prepare($sql);

        $consulta->execute([
            'motivo_prestamo' => $motivoPrestamo,
            'dispositivo' => $dispositivo,
            'id_prioridad' => $idPrioridad,
            'id_prestamo' => $idPrestamo
        ]);
    }

    // ---------- métodos para encargados --------------

    public function listarTodos(): array
    {
        $sql = '
            SELECT
                t.id_prestamo,
                t.motivo_prestamo,
                t.fecha,
                t.dispositivo,
                t.id_usuario,
                t.id_estado,
                t.id_prioridad,

                u.usuario AS creador,
                e.nombre AS estado,
                p.nombre AS prioridad

            FROM prestamos AS t

            INNER JOIN usuarios AS u
                ON u.id_usuario = t.id_usuario

            INNER JOIN estados AS e
                ON e.id_estado = t.id_estado

            INNER JOIN prioridades AS p
                ON p.id_prioridad = t.id_prioridad

            ORDER BY t.fecha DESC
        ';

        $consulta = $this->conexion->query($sql);

        return $consulta->fetchAll(PDO::FETCH_ASSOC);
    }

    public function actualizarComoEncargado(
        int $idPrestamo,
        string $motivoPrestamo,
        ?string $dispositivo,
        int $idPrioridad,
        int $idEstado
    ): void {
        $sql = '
            UPDATE prestamos
            SET
                motivo_prestamo = :motivo_prestamo,
                dispositivo = :dispositivo,
                id_prioridad = :id_prioridad,
                id_estado = :id_estado
            WHERE id_prestamo = :id_prestamo
        ';

        $consulta = $this->conexion->prepare($sql);

        $consulta->execute([
            'motivo_prestamo' => $motivoPrestamo,
            'dispositivo' => $dispositivo,
            'id_prioridad' => $idPrioridad,
            'id_estado' => $idEstado,
            'id_prestamo' => $idPrestamo
        ]);
    }
}