<?php
declare(strict_types=1);

final class MenuItem
{
    public function __construct(private PDO $connection)
    {
    }

    public function allForBranch(?int $branchId = null): array
    {
        $sql = 'SELECT m.menu_item_id, m.name, m.category, m.description, m.price_bdt, m.image_url,
                       COALESCE(a.status, \'available\') AS availability
                FROM menu_items m
                LEFT JOIN branch_menu_availability a
                  ON a.menu_item_id = m.menu_item_id';
        $parameters = [];

        if ($branchId !== null) {
            $sql .= ' AND a.branch_id = :branch_id';
            $parameters['branch_id'] = $branchId;
        }

        $sql .= ' WHERE m.active = 1 ORDER BY m.category, m.name';
        $statement = $this->connection->prepare($sql);
        $statement->execute($parameters);

        return $statement->fetchAll();
    }

    public function allForAdmin(): array
    {
        $statement = $this->connection->query(
            'SELECT menu_item_id, name, category, description, price_bdt, active, image_url FROM menu_items ORDER BY category, name'
        );

        return $statement->fetchAll();
    }

    public function countAll(): int
    {
        $statement = $this->connection->query('SELECT COUNT(*) FROM menu_items');

        return (int) $statement->fetchColumn();
    }

    public function create(array $data): ?int
    {
        $statement = $this->connection->prepare(
            'INSERT INTO menu_items (name, category, description, price_bdt, active, image_url)
             VALUES (:name, :category, :description, :price_bdt, :active, :image_url)'
        );

        $result = $statement->execute([
            'name' => $data['name'],
            'category' => $data['category'],
            'description' => $data['description'] ?? '',
            'price_bdt' => $data['price_bdt'],
            'active' => (int) ($data['active'] ?? 1),
            'image_url' => $data['image_url'] ?? null,
        ]);

        return $result ? (int) $this->connection->lastInsertId() : null;
    }

    public function update(array $data): bool
    {
        $statement = $this->connection->prepare(
            'UPDATE menu_items
             SET name = :name,
                category = :category,
                description = :description,
                price_bdt = :price_bdt,
                active = :active,
                image_url = :image_url
             WHERE menu_item_id = :menu_item_id'
        );

        return $statement->execute([
            'menu_item_id' => $data['menu_item_id'],
            'name' => $data['name'],
            'category' => $data['category'],
            'description' => $data['description'] ?? '',
            'price_bdt' => $data['price_bdt'],
            'active' => (int) ($data['active'] ?? 1),
            'image_url' => $data['image_url'] ?? null,
        ]);
    }

    public function delete(int $menuItemId): bool
    {
        $statement = $this->connection->prepare('DELETE FROM menu_items WHERE menu_item_id = :menu_item_id');

        return $statement->execute(['menu_item_id' => $menuItemId]);
    }

    public function setAvailability(int $branchId, int $menuItemId, string $status): bool
    {
        if (!in_array($status, ['available', 'unavailable'], true)) {
            throw new InvalidArgumentException('Invalid menu availability status.');
        }

        $statement = $this->connection->prepare(
            'INSERT INTO branch_menu_availability (branch_id, menu_item_id, status)
             VALUES (:branch_id, :menu_item_id, :status)
             ON DUPLICATE KEY UPDATE status = VALUES(status)'
        );

        return $statement->execute([
            'branch_id' => $branchId,
            'menu_item_id' => $menuItemId,
            'status' => $status,
        ]);
    }
}
