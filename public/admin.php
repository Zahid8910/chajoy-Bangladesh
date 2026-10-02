<?php

declare(strict_types=1);

session_start();

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../app/models/User.php';
require_once __DIR__ . '/../app/models/MenuItem.php';
require_once __DIR__ . '/../app/models/Branch.php';
require_once __DIR__ . '/../app/controllers/AdminController.php';

header('Content-Type: application/json; charset=utf-8');

$pageAliases = [
    'admin' => 'admin',
    'dashboard' => 'admin',
    'admin_users' => 'admin_users',
    'user-management' => 'admin_users',
    'admin_menu' => 'admin_menu',
    'menu' => 'admin_menu',
    'admin_branches' => 'admin_branches',
    'branches' => 'admin_branches',
];

if (isset($_GET['action']) && array_key_exists((string) $_GET['action'], $pageAliases)) {
    if (!isset($_SESSION['role']) || strtolower((string) $_SESSION['role']) !== 'admin') {
        $redirectTarget = isset($_SESSION['role']) ? '../home.html' : '../Sign_up.html';
        header('Location: ' . $redirectTarget, true, 302);
        exit;
    }

    $requestedAction = (string) $_GET['action'];
    $page = $pageAliases[$requestedAction];

    header('Content-Type: text/html; charset=utf-8');
    $content = file_get_contents(__DIR__ . '/../admin.html');
    $content = str_replace([
        'data-admin-page="admin"',
        'data-admin-page="dashboard"',
    ], 'data-admin-page="' . $page . '"', $content);
    echo $content;
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$raw = file_get_contents('php://input');
$data = [];
if ($method === 'POST' && $raw !== '') {
    $decoded = json_decode($raw, true);
    if (is_array($decoded)) {
        $data = $decoded;
    } else {
        parse_str($raw, $data);
    }
}
$data = array_merge($_GET, $_POST, $data);
$action = (string) ($data['action'] ?? ($_GET['action'] ?? 'dashboard'));

if ($action === 'logout') {
    session_unset();
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Logged out successfully.'], JSON_THROW_ON_ERROR);
    exit;
}

$sessionRole = isset($_SESSION['role']) ? strtolower((string) $_SESSION['role']) : '';
if (!isset($_SESSION['user_id']) || $sessionRole === '') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized access.'], JSON_THROW_ON_ERROR);
    exit;
}

$adminAllowedActions = ['dashboard', 'profile', 'update-profile', 'users', 'add-user', 'update-user', 'delete-user', 'branches', 'save-branch', 'delete-branch'];
$employeeMenuActions = ['menu', 'save-menu-item', 'delete-menu-item'];
$canAccessAdminApis = $sessionRole === 'admin';
$canAccessMenuApis = $sessionRole === 'admin' || $sessionRole === 'employee';

if (!$canAccessAdminApis && !in_array($action, $employeeMenuActions, true)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized access.'], JSON_THROW_ON_ERROR);
    exit;
}

if (!$canAccessMenuApis && in_array($action, $employeeMenuActions, true)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized access.'], JSON_THROW_ON_ERROR);
    exit;
}

$connection = Database::connect();
$controller = new AdminController(new User($connection), new MenuItem($connection), new Branch($connection));
$adminUserId = (int) ($_SESSION['user_id'] ?? 0);

try {
    switch ($action) {
        case 'dashboard':
            echo json_encode(['success' => true, 'data' => $controller->dashboard($adminUserId)], JSON_THROW_ON_ERROR);
            break;

        case 'profile':
            echo json_encode(['success' => true, 'data' => $controller->profile($adminUserId)], JSON_THROW_ON_ERROR);
            break;

        case 'update-profile':
            echo json_encode($controller->updateProfile($adminUserId, $data), JSON_THROW_ON_ERROR);
            break;

        case 'users':
            echo json_encode([
                'success' => true,
                'data' => $controller->users((string) ($data['search'] ?? ''), (string) ($data['role'] ?? '')),
            ], JSON_THROW_ON_ERROR);
            break;

        case 'add-user':
            echo json_encode($controller->addUser($data), JSON_THROW_ON_ERROR);
            break;

        case 'update-user':
            echo json_encode($controller->updateUser($adminUserId, (int) ($data['user_id'] ?? 0), $data), JSON_THROW_ON_ERROR);
            break;

        case 'delete-user':
            echo json_encode($controller->deleteUser($adminUserId, (int) ($data['user_id'] ?? 0)), JSON_THROW_ON_ERROR);
            break;

        case 'menu':
            echo json_encode(['success' => true, 'data' => $controller->menuItems()], JSON_THROW_ON_ERROR);
            break;

        case 'save-menu-item':
            $uploaded = $_FILES['image'] ?? null;
            echo json_encode($controller->saveMenuItem($data, $uploaded), JSON_THROW_ON_ERROR);
            break;

        case 'delete-menu-item':
            echo json_encode($controller->deleteMenuItem((int) ($data['menu_item_id'] ?? 0)), JSON_THROW_ON_ERROR);
            break;

        case 'branches':
            echo json_encode(['success' => true, 'data' => $controller->branches()], JSON_THROW_ON_ERROR);
            break;

        case 'save-branch':
            echo json_encode($controller->saveBranch($data), JSON_THROW_ON_ERROR);
            break;

        case 'delete-branch':
            echo json_encode($controller->deleteBranch((int) ($data['branch_id'] ?? 0)), JSON_THROW_ON_ERROR);
            break;

        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid admin action.'], JSON_THROW_ON_ERROR);
            break;
    }
} catch (Throwable $exception) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $exception->getMessage()], JSON_THROW_ON_ERROR);
}
