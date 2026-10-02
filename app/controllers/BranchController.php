<?php
declare(strict_types=1);

final class BranchController
{
    public function __construct(private Branch $branches)
    {
    }

    public function index(bool $activeOnly = false): array
    {
        return $this->branches->all($activeOnly);
    }

    public function find(string $name): ?array
    {
        return $this->branches->findByName($name);
    }
}
