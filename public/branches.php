<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../app/models/Branch.php';
require_once __DIR__ . '/../app/controllers/BranchController.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $connection = Database::connect();
    $controller = new BranchController(new Branch($connection));

    echo json_encode([
        'success' => true,
        'data' => $controller->index(),
    ], JSON_THROW_ON_ERROR);
} catch (Throwable $exception) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Unable to load branches.',
    ], JSON_THROW_ON_ERROR);
}
