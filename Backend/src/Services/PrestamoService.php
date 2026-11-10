<?php

final class PrestamoService
{
    private array $dispositivosPermitidos = [
        'Laptop Ceibal 01',
        'Laptop Ceibal 02',
        'Proyector Epson',
        'Tablet',
        'Cámara digital',
        'Kit de Robótica'
    ];

    public function __construct(
        private Prestamo $prestamoModel,
        private Estado $estadoModel,
        private Prioridad $prioridadModel
    ) {
    }

    public function listarDelUsuario(int $idUsuario): array 
    {
        return $this->prestamoModel->listarAbiertosPorUsuario($idUsuario);
    }

    public function listarPrioridades(): array
    {
        return $this->prioridadModel->listar();
    }

    public function crear(
        int $idUsuario,
        string $motivoPrestamo,
        ?string $dispositivo,
        int $idPrioridad
    ): int {
        $this->validarDatos($motivoPrestamo, $dispositivo, $idPrioridad);

        $estadoSolicitado = $this->estadoModel->buscarPorNombre('Solicitado');

        if ($estadoSolicitado === null) {
            throw new RuntimeException(
                'El estado Solicitado no está registrado',
                500
            );
        }

        return $this->prestamoModel->crear(
            trim($motivoPrestamo),
            $dispositivo,
            $idUsuario,
            (int) $estadoSolicitado['id_estado'],
            $idPrioridad
        );
    }

    public function actualizar(
        int $idUsuario,
        int $idPrestamo,
        string $motivoPrestamo,
        ?string $dispositivo,
        int $idPrioridad
    ): void {
        $prestamo = $this->prestamoModel->buscarPorId($idPrestamo);

        if ($prestamo === null) {
            throw new RuntimeException(
                'El préstamo no existe',
                404
            );
        }

        if ((int) $prestamo['id_usuario'] !== $idUsuario) {
            throw new RuntimeException(
                'No puedes modificar un préstamo ajeno',
                403
            );
        }

        if (strcasecmp($prestamo['estado'], 'Solicitado') !== 0) {
            throw new RuntimeException(
                'El préstamo ya no puede modificarse',
                409
            );
        }

        $this->validarDatos($motivoPrestamo, $dispositivo, $idPrioridad);

        $this->prestamoModel->actualizar(
            $idPrestamo,
            trim($motivoPrestamo),
            $dispositivo,
            $idPrioridad
        );
    }

    private function validarDatos(
        string $motivoPrestamo,
        ?string $dispositivo,
        int $idPrioridad
    ): void {
        if (trim($motivoPrestamo) === '') {
            throw new RuntimeException(
                'El motivo de préstamo es obligatorio',
                422
            );
        }

        if (
            $dispositivo !== null &&
            !in_array($dispositivo, $this->dispositivosPermitidos, true)
        ) {
            throw new RuntimeException(
                'El dispositivo seleccionado no es válido',
                422
            );
        }

        if (
            $this->prioridadModel->buscarPorId($idPrioridad) === null
        ) {
            throw new RuntimeException(
                'La prioridad seleccionada no existe',
                422
            );
        }
    }

    // ---------- Funciones de encargado ----------

    public function listarTodos(): array
    {
        return $this->prestamoModel->listarTodos();
    }

    public function listarEstados(): array
    {
        return $this->estadoModel->listar();
    }

    public function actualizarComoEncargado(
        int $idPrestamo,
        string $motivoPrestamo,
        ?string $dispositivo,
        int $idPrioridad,
        int $idEstado
    ): void {
        $prestamo = $this->prestamoModel->buscarPorId($idPrestamo);

        if ($prestamo === null) {
            throw new RuntimeException(
                'El préstamo no existe',
                404
            );
        }

        $estadoActual = strtolower(trim($prestamo['estado']));

        if (
            $estadoActual !== 'solicitado' &&
            $estadoActual !== 'entregado'
        ) {
            throw new RuntimeException(
                'Este préstamo ya no puede modificarse',
                409
            );
        }

        $this->validarDatos($motivoPrestamo, $dispositivo, $idPrioridad);

        $estadoNuevo = $this->estadoModel->buscarPorId($idEstado);

        if ($estadoNuevo === null) {
            throw new RuntimeException(
                'El estado seleccionado no existe',
                422
            );
        }

        $this->prestamoModel->actualizarComoEncargado(
            $idPrestamo,
            trim($motivoPrestamo),
            $dispositivo,
            $idPrioridad,
            $idEstado
        );
    }
}