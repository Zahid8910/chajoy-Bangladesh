<?php
declare(strict_types=1);

final class MenuController
{
    public function __construct(private MenuItem $menuItems)
    {
    }

    public function index(?int $branchId = null): array
    {
        return $this->menuItems->allForBranch($branchId);
    }

    public function updateAvailability(int $branchId, int $menuItemId, string $status): bool
    {
        return $this->menuItems->setAvailability($branchId, $menuItemId, $status);
    }
}
