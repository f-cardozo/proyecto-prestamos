<?php

$conexion = Conexion::conectar();

$usuarioModel = new Usuario($conexion);
$prestamoModel = new Prestamo($conexion);
$authService = new AuthService($usuarioModel);
$authController = new AuthController($authService);
$usuarioService = new UsuarioService($usuarioModel);
$usuarioController = new UsuarioController($usuarioService);

$estadoModel = new Estado($conexion);
$prioridadModel = new Prioridad($conexion);

$prestamoService = new PrestamoService($prestamoModel, $estadoModel, $prioridadModel);
$prestamoController = new PrestamoController($prestamoService);


//Rutas login

$router->post('/api/login', [$authController, 'login']);
$router->get('/api/sesion', [$authController, 'sesion']);
$router->post('/api/logout', [$authController, 'logout']);


$router->post('/api/usuarios', function () use ($usuarioController): void {
    RolMiddleware::soloEncargado();
    $usuarioController->crear();
});


//Rutas préstamos

$router->get('/api/prestamos', function () use ($prestamoController): void {
    // Permitimos a docentes y alumnos ver sus propios préstamos
    $usuario = AuthMiddleware::verificar();
    if ($usuario['rol'] !== 'docente' && $usuario['rol'] !== 'alumno') {
        Response::json(['error' => 'No autorizado'], 403);
    }
    $prestamoController->listar();
});

$router->post('/api/prestamos', function () use ($prestamoController): void {
    $usuario = AuthMiddleware::verificar();
    if ($usuario['rol'] !== 'docente' && $usuario['rol'] !== 'alumno') {
        Response::json(['error' => 'No autorizado'], 403);
    }
    $prestamoController->crear();
});

$router->put('/api/prestamos', function () use ($prestamoController): void {
    $usuario = AuthMiddleware::verificar();
    if ($usuario['rol'] !== 'docente' && $usuario['rol'] !== 'alumno') {
        Response::json(['error' => 'No autorizado'], 403);
    }
    $prestamoController->actualizar();
});

//Rutas de Encargado

$router->get('/api/encargado/prestamos', function () use ($prestamoController): void {
    RolMiddleware::soloEncargado();
    $prestamoController->listarTodos();
});

$router->post('/api/encargado/prestamos', function () use ($prestamoController): void {
    RolMiddleware::soloEncargado();
    $prestamoController->crear();
});

$router->put('/api/encargado/prestamos', function () use ($prestamoController): void {
    RolMiddleware::soloEncargado();
    $prestamoController->actualizarComoEncargado();
});