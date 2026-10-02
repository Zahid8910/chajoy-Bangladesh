<?php
declare(strict_types=1);

final class OrderController
{
    public function __construct(private Order $orders)
    {
    }

    public function create(int $customerId, int $branchId, array $items): int
    {
        return $this->orders->create($customerId, $branchId, $items);
    }

    public function customerOrders(int $customerId): array
    {
        return $this->orders->forCustomer($customerId);
    }

    public function branchOrders(int $branchId): array
    {
        return $this->orders->forBranch($branchId);
    }

    public function updateStatus(int $orderId, string $status, ?string $reason = null): bool
    {
        return $this->orders->updateStatus($orderId, $status, $reason);
    }
}
