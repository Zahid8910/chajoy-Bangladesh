<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../app/models/MenuItem.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $menuItems = new MenuItem(Database::connect());
    echo json_encode([
        'success' => true,
        'data' => $menuItems->allForBranch(),
    ], JSON_THROW_ON_ERROR);
} catch (Throwable $exception) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Unable to load menu items.',
    ], JSON_THROW_ON_ERROR);
}
