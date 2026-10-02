<?php

declare(strict_types=1);

session_start();

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../app/models/Branch.php';
require_once __DIR__ . '/../app/models/Order.php';
require_once __DIR__ . '/../app/controllers/OrderController.php';

header('Content-Type: application/json; charset=utf-8');

$connection = Database::connect();
$orderController = new OrderController(new Order($connection));
$branchModel = new Branch($connection);

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

$action = (string) ($_GET['action'] ?? ($data['action'] ?? 'customer_history'));

if ($action === 'customer_history') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Please log in to view your order history.']);
        exit;
    }

    $orders = $orderController->customerOrders((int) $_SESSION['user_id']);
    echo json_encode(['success' => true, 'data' => $orders], JSON_THROW_ON_ERROR);
    exit;
}

if ($action === 'employee_orders') {
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['role'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Employee login required.']);
        exit;
    }

    $branchId = null;
    if (isset($_GET['branch_id']) && $_GET['branch_id'] !== '') {
        $branchId = (int) $_GET['branch_id'];
        $orders = $orderController->branchOrders($branchId);
    } else {
        $branchName = trim((string) ($_GET['branch'] ?? ''));
        if ($branchName !== '') {
            $branch = $branchModel->findByName($branchName);
            if ($branch !== null) {
                $orders = $orderController->branchOrders((int) $branch['branch_id']);
            } else {
                $orders = [];
            }
        } else {
            $orders = $connection->query(
                'SELECT o.*, u.username AS customer_username, b.name AS branch_name
                 FROM orders o
                 INNER JOIN users u ON u.user_id = o.customer_id
                 INNER JOIN branches b ON b.branch_id = o.branch_id
                 ORDER BY o.created_at DESC'
            )->fetchAll();
            foreach ($orders as &$order) {
                $order['items'] = (new Order($connection))->itemsForOrder((int) $order['order_id']);
                $order['branch'] = $order['branch_name'];
            }
            unset($order);
        }
    }

    echo json_encode(['success' => true, 'data' => $orders], JSON_THROW_ON_ERROR);
    exit;
}

if ($action === 'create_order') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Please log in to place an order.']);
        exit;
    }

    $branchId = isset($data['branch_id']) ? (int) $data['branch_id'] : null;
    $branchName = trim((string) ($data['branch'] ?? ''));
    if ($branchId === null && $branchName !== '') {
        $branch = $branchModel->findByName($branchName);
        if ($branch === null) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Selected branch was not found.']);
            exit;
        }
        $branchId = (int) $branch['branch_id'];
    }

    $items = is_array($data['items'] ?? null) ? $data['items'] : [];
    if ($branchId === null || $items === []) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Branch and order items are required.']);
        exit;
    }

    $normalizedItems = [];
    foreach ($items as $item) {
        $itemName = trim((string) ($item['name'] ?? ''));
        $itemPrice = (float) ($item['price'] ?? ($item['unit_price_bdt'] ?? 0));
        $quantity = (int) ($item['quantity'] ?? 1);
        if ($itemName === '' || $quantity < 1 || $itemPrice < 0) {
            continue;
        }

        $normalizedItems[] = [
            'menu_item_id' => (int) ($item['menu_item_id'] ?? 0),
            'item_name_snapshot' => $itemName,
            'unit_price_bdt' => $itemPrice,
            'quantity' => $quantity,
        ];
    }

    if ($normalizedItems === []) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'At least one valid menu item is required.']);
        exit;
    }

    $orderId = $orderController->create((int) $_SESSION['user_id'], $branchId, $normalizedItems);
    $order = $connection->query(
        'SELECT * FROM orders WHERE order_id = ' . (int) $orderId
    )->fetch();

    echo json_encode([
        'success' => true,
        'message' => 'Order placed successfully.',
        'data' => [
            'order_id' => $orderId,
            'receipt_number' => $order['receipt_number'],
            'status' => $order['status'],
            'branch_id' => $branchId,
            'total_bdt' => (float) $order['total_bdt'],
            'items' => $normalizedItems,
        ],
    ], JSON_THROW_ON_ERROR);
    exit;
}

if ($action === 'update_status') {
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['role'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Employee login required.']);
        exit;
    }

    $orderId = isset($data['order_id']) ? (int) $data['order_id'] : 0;
    $status = strtolower(trim((string) ($data['status'] ?? '')));
    $reason = trim((string) ($data['rejection_reason'] ?? ''));

    if ($orderId <= 0 || $status === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Order and status are required.']);
        exit;
    }

    $updated = $orderController->updateStatus($orderId, $status, $reason !== '' ? $reason : null);
    echo json_encode([
        'success' => $updated,
        'message' => $updated ? 'Order status updated.' : 'Failed to update order status.',
    ], JSON_THROW_ON_ERROR);
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'message' => 'Invalid order action.']);
