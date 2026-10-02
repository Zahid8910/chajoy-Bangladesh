<?php
declare(strict_types=1);

final class Branch
{
    public function __construct(private PDO $connection)
    {
    }

    public function all(bool $activeOnly = false): array
    {
        $sql = 'SELECT branch_id, name, status, map_url FROM branches';
        if ($activeOnly) {
            $sql .= " WHERE status = 'active'";
        }
        $sql .= ' ORDER BY name';

        return $this->connection->query($sql)->fetchAll();
    }

    public function findById(int $branchId): ?array
    {
        $statement = $this->connection->prepare(
            'SELECT branch_id, name, status, map_url FROM branches WHERE branch_id = :branch_id LIMIT 1'
        );
        $statement->execute(['branch_id' => $branchId]);
        $branch = $statement->fetch();

        return $branch ?: null;
    }

    public function findByName(string $name): ?array
    {
        $statement = $this->connection->prepare(
            'SELECT branch_id, name, status, map_url FROM branches WHERE name = :name LIMIT 1'
        );
        $statement->execute(['name' => $name]);
        $branch = $statement->fetch();

        return $branch ?: null;
    }

    public function create(array $data): ?int
    {
        $statement = $this->connection->prepare(
            'INSERT INTO branches (name, status, map_url) VALUES (:name, :status, :map_url)'
        );

        $result = $statement->execute([
            'name' => trim((string) ($data['name'] ?? '')),
            'status' => in_array(strtolower((string) ($data['status'] ?? 'active')), ['active', 'upcoming'], true)
                ? strtolower((string) $data['status'])
                : 'active',
            'map_url' => trim((string) ($data['map_url'] ?? '')),
        ]);

        return $result ? (int) $this->connection->lastInsertId() : null;
    }

    public function update(int $branchId, array $data): bool
    {
        $statement = $this->connection->prepare(
            'UPDATE branches SET name = :name, status = :status, map_url = :map_url WHERE branch_id = :branch_id'
        );

        return $statement->execute([
            'branch_id' => $branchId,
            'name' => trim((string) ($data['name'] ?? '')),
            'status' => in_array(strtolower((string) ($data['status'] ?? 'active')), ['active', 'upcoming'], true)
                ? strtolower((string) $data['status'])
                : 'active',
            'map_url' => trim((string) ($data['map_url'] ?? '')),
        ]);
    }

    public function delete(int $branchId): bool
    {
        $statement = $this->connection->prepare('DELETE FROM branches WHERE branch_id = :branch_id');

        return $statement->execute(['branch_id' => $branchId]);
    }
}
