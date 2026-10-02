<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../app/models/Branch.php';
require_once __DIR__ . '/../app/models/MenuItem.php';
require_once __DIR__ . '/../app/models/Order.php';
require_once __DIR__ . '/../app/models/Review.php';
require_once __DIR__ . '/../app/models/User.php';
require_once __DIR__ . '/../app/controllers/MenuController.php';
require_once __DIR__ . '/../app/controllers/OrderController.php';
require_once __DIR__ . '/../app/controllers/ProfileController.php';
require_once __DIR__ . '/../app/controllers/BranchController.php';
require_once __DIR__ . '/../app/controllers/ReviewController.php';

$connection = Database::connect();

// MVC bootstrap: feature-specific routes can instantiate these controllers.
$controllers = [
    'menu' => new MenuController(new MenuItem($connection)),
    'orders' => new OrderController(new Order($connection)),
    'profile' => new ProfileController(new User($connection)),
    'branches' => new BranchController(new Branch($connection)),
    'reviews' => new ReviewController(new Review($connection)),
];

header('Content-Type: application/json; charset=utf-8');
echo json_encode(['status' => 'ok', 'controllers' => array_keys($controllers)], JSON_THROW_ON_ERROR);
