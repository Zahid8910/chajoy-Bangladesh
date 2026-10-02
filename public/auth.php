<?php

declare(strict_types=1);

session_start();

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../app/models/User.php';
require_once __DIR__ . '/../app/controllers/AuthController.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'errors' => ['general' => 'Only POST requests are allowed.']]);
    exit;
}

$rawBody = file_get_contents('php://input');
$data = [];
if ($rawBody !== '') {
    $decoded = json_decode($rawBody, true);
    if (is_array($decoded)) {
        $data = $decoded;
    } else {
        parse_str($rawBody, $data);
    }
}

$data = array_merge($_POST, $data);
$action = (string) ($data['action'] ?? 'register');

if ($action === 'logout') {
    session_unset();
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Logged out successfully.']);
    exit;
}

$connection = Database::connect();
$controller = new AuthController(new User($connection));

if ($action === 'login') {
    $result = $controller->login($data);
    if (($result['success'] ?? false) && !empty($result['role'])) {
        $_SESSION['role'] = ucfirst((string) $result['role']);
        $user = $result['user'] ?? null;
        if (is_array($user) && !empty($user['user_id'])) {
            $_SESSION['user_id'] = (int) $user['user_id'];
        } elseif (isset($data['email']) && strtolower((string) $data['email']) === 'admin@gmail.com') {
            $_SESSION['user_id'] = 4;
        }
    }
    echo json_encode($result, JSON_THROW_ON_ERROR);
    exit;
}

if ($action === 'forgot-question') {
    echo json_encode($controller->forgotQuestion($data), JSON_THROW_ON_ERROR);
    exit;
}

if ($action === 'reset-password') {
    echo json_encode($controller->resetPassword($data), JSON_THROW_ON_ERROR);
    exit;
}

if ($action === 'verify-recovery-answer') {
    echo json_encode($controller->verifyRecoveryAnswer($data), JSON_THROW_ON_ERROR);
    exit;
}

$result = $controller->register($data);
if (($result['success'] ?? false) && !empty($result['user_id'])) {
    $registeredRole = strtolower((string) ($result['role'] ?? 'customer'));
    $_SESSION['role'] = ucfirst($registeredRole);
    $_SESSION['user_id'] = (int) $result['user_id'];
}

echo json_encode($result, JSON_THROW_ON_ERROR);
