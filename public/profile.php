<?php

declare(strict_types=1);

session_start();

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../app/models/User.php';
require_once __DIR__ . '/../app/controllers/ProfileController.php';

header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Please log in to update your profile.']);
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

$data = array_merge($_POST, $_GET, $data);
$action = (string) ($data['action'] ?? 'profile');

$connection = Database::connect();
$userModel = new User($connection);
$controller = new ProfileController($userModel);
$userId = (int) $_SESSION['user_id'];

if ($action === 'profile') {
    $profile = $controller->show($userId);
    if ($profile === null) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Profile not found.']);
        exit;
    }

    unset($profile['password_hash'], $profile['security_answer_hash']);
    echo json_encode(['success' => true, 'data' => $profile], JSON_THROW_ON_ERROR);
    exit;
}

if ($action === 'update-profile') {
    $username = trim((string) ($data['username'] ?? ''));
    $email = strtolower(trim((string) ($data['email'] ?? '')));
    $fullName = trim((string) ($data['full_name'] ?? ''));
    $contact = trim((string) ($data['contact'] ?? ''));
    $gender = trim((string) ($data['gender'] ?? ''));
    $password = trim((string) ($data['password'] ?? ''));

    if ($username === '' || $email === '') {
        echo json_encode(['success' => false, 'message' => 'Username and email are required.']);
        exit;
    }

    $payload = [
        'username' => $username,
        'email' => $email,
        'full_name' => $fullName !== '' ? $fullName : $username,
        'contact' => $contact,
        'gender' => $gender,
    ];

    if ($password !== '') {
        $payload['password'] = $password;
    }

    $updated = $userModel->updateUser($userId, $payload);
    echo json_encode([
        'success' => $updated,
        'message' => $updated ? 'Profile updated successfully.' : 'Profile update failed.',
    ], JSON_THROW_ON_ERROR);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Unknown profile action.'], JSON_THROW_ON_ERROR);
