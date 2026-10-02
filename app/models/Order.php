<?php
declare(strict_types=1);

final class Order
{
    public function __construct(private PDO $connection)
    {
    }

    public function create(int $customerId, int $branchId, array $items): int
    {
        if ($items === []) {
            throw new InvalidArgumentException('An order must contain at least one item.');
        }

        $this->connection->beginTransaction();
        try {
            $total = 0.0;
            foreach ($items as $item) {
                if ((int) ($item['quantity'] ?? 0) < 1 || (float) ($item['unit_price_bdt'] ?? -1) < 0) {
                    throw new InvalidArgumentException('Order item quantity and price are invalid.');
                }
                $total += (float) $item['unit_price_bdt'] * (int) $item['quantity'];
            }

            $receiptNumber = 'CJ-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 6));
            $orderStatement = $this->connection->prepare(
                'INSERT INTO orders (receipt_number, customer_id, branch_id, total_bdt)
                 VALUES (:receipt_number, :customer_id, :branch_id, :total_bdt)'
            );
            $orderStatement->execute([
                'receipt_number' => $receiptNumber,
                'customer_id' => $customerId,
                'branch_id' => $branchId,
                'total_bdt' => $total,
            ]);
            $orderId = (int) $this->connection->lastInsertId();

            $itemStatement = $this->connection->prepare(
                'INSERT INTO order_items
                    (order_id, menu_item_id, item_name_snapshot, unit_price_bdt, quantity)
                 VALUES
                    (:order_id, :menu_item_id, :item_name_snapshot, :unit_price_bdt, :quantity)'
            );
            foreach ($items as $item) {
                $itemStatement->execute([
                    'order_id' => $orderId,
                    'menu_item_id' => $item['menu_item_id'],
                    'item_name_snapshot' => $item['item_name_snapshot'],
                    'unit_price_bdt' => $item['unit_price_bdt'],
                    'quantity' => $item['quantity'],
                ]);
            }

            $this->connection->commit();
            return $orderId;
        } catch (Throwable $exception) {
            $this->connection->rollBack();
            throw $exception;
        }
    }

    public function itemsForOrder(int $orderId): array
    {
        $statement = $this->connection->prepare(
            'SELECT order_item_id, menu_item_id, item_name_snapshot, unit_price_bdt, quantity
             FROM order_items
             WHERE order_id = :order_id
             ORDER BY order_item_id ASC'
        );
        $statement->execute(['order_id' => $orderId]);

        return $statement->fetchAll();
    }

    public function forCustomer(int $customerId): array
    {
        $statement = $this->connection->prepare(
            'SELECT o.*, b.name AS branch_name
             FROM orders o
             INNER JOIN branches b ON b.branch_id = o.branch_id
             WHERE o.customer_id = :customer_id
             ORDER BY o.created_at DESC'
        );
        $statement->execute(['customer_id' => $customerId]);
        $orders = $statement->fetchAll();

        foreach ($orders as &$order) {
            $order['items'] = $this->itemsForOrder((int) $order['order_id']);
            $order['branch'] = $order['branch_name'];
        }
        unset($order);

        return $orders;
    }

    public function forBranch(int $branchId): array
    {
        $statement = $this->connection->prepare(
            'SELECT o.*, u.username AS customer_username, b.name AS branch_name
             FROM orders o
             INNER JOIN users u ON u.user_id = o.customer_id
             INNER JOIN branches b ON b.branch_id = o.branch_id
             WHERE o.branch_id = :branch_id
             ORDER BY o.created_at DESC'
        );
        $statement->execute(['branch_id' => $branchId]);
        $orders = $statement->fetchAll();

        foreach ($orders as &$order) {
            $order['items'] = $this->itemsForOrder((int) $order['order_id']);
            $order['branch'] = $order['branch_name'];
        }
        unset($order);

        return $orders;
    }

    public function updateStatus(int $orderId, string $status, ?string $rejectionReason = null): bool
    {
        $allowedStatuses = ['received', 'preparing', 'ready', 'rejected', 'picked_up'];
        if (!in_array($status, $allowedStatuses, true)) {
            throw new InvalidArgumentException('Invalid order status.');
        }

        $statement = $this->connection->prepare(
            'UPDATE orders
             SET status = :status, rejection_reason = :rejection_reason
             WHERE order_id = :order_id'
        );

        return $statement->execute([
            'order_id' => $orderId,
            'status' => $status,
            'rejection_reason' => $status === 'rejected' ? $rejectionReason : null,
        ]);
    }
}
