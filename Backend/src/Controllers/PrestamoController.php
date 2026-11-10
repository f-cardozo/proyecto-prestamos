<?php

final class PrestamoController
{
    public function __construct(
        private PrestamoService $prestamoService
    ) {
    }

    public function listar(): void
    {
        $usuario = AuthMiddleware::verificar();

        $prestamos = $this->prestamoService
            ->listarDelUsuario($usuario['id_usuario']);

        $prioridades = $this->prestamoService
            ->listarPrioridades();

        Response::json([
            'prestamos' => $prestamos,
            'prioridades' => $prioridades
        ]);
    }

    public function crear(): void
    {
        $usuario = AuthMiddleware::verificar();
        $datos = $this->leerJson();

        try {
            $idPrestamo = $this->prestamoService->crear(
                $usuario['id_usuario'],
                $datos['motivo_prestamo'] ?? $datos['descripcion'] ?? '',
                $this->obtenerDispositivo($datos),
                (int) ($datos['id_prioridad'] ?? 0)
            );

            Response::json([
                'mensaje' => 'Préstamo creado correctamente',
                'id_prestamo' => $idPrestamo
            ], 201);
        } catch (RuntimeException $error) {
            $this->responderError($error);
        }
    }

    public function actualizar(): void
    {
        $usuario = AuthMiddleware::verificar();
        $datos = $this->leerJson();

        try {
            $this->prestamoService->actualizar(
                $usuario['id_usuario'],
                (int) ($datos['id_prestamo'] ?? $datos['id_ticket'] ?? 0),
                $datos['motivo_prestamo'] ?? $datos['descripcion'] ?? '',
                $this->obtenerDispositivo($datos),
                (int) ($datos['id_prioridad'] ?? 0)
            );

            Response::json([
                'mensaje' => 'Préstamo actualizado correctamente'
            ]);
        } catch (RuntimeException $error) {
            $this->responderError($error);
        }
    }

    private function leerJson(): array
    {
        $contenido = file_get_contents('php://input');

        try {
            return json_decode(
                $contenido,
                true,
                512,
                JSON_THROW_ON_ERROR
            );
        } catch (JsonException) {
            Response::json([
                'error' => 'El contenido JSON no es válido'
            ], 400);
        }
    }

    private function obtenerDispositivo(array $datos): ?string
    {
        $dispositivo = $datos['dispositivo'] ?? $datos['sala'] ?? null;

        if ($dispositivo === '') {
            return null;
        }

        return $dispositivo;
    }

    private function responderError(
        RuntimeException $error
    ): never {
        $codigo = $error->getCode();

        if (
            !in_array(
                $codigo,
                [403, 404, 409, 422, 500],
                true
            )
        ) {
            $codigo = 500;
        }

        Response::json([
            'error' => $error->getMessage()
        ], $codigo);
    }

    public function listarTodos(): void
    {
        Response::json([
            'prestamos' => $this->prestamoService->listarTodos(),
            'prioridades' => $this->prestamoService->listarPrioridades(),
            'estados' => $this->prestamoService->listarEstados()
        ]);
    }

    public function actualizarComoEncargado(): void
    {
        $datos = $this->leerJson();

        try {
            $this->prestamoService->actualizarComoEncargado(
                (int) ($datos['id_prestamo'] ?? $datos['id_ticket'] ?? 0),
                $datos['motivo_prestamo'] ?? $datos['descripcion'] ?? '',
                $this->obtenerDispositivo($datos),
                (int) ($datos['id_prioridad'] ?? 0),
                (int) ($datos['id_estado'] ?? 0)
            );

            Response::json([
                'mensaje' => 'Préstamo actualizado correctamente'
            ]);
        } catch (RuntimeException $error) {
            $this->responderError($error);
        }
    }
}