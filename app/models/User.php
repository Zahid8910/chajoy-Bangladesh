<?php
declare(strict_types=1);

final class User
{
    public function __construct(private PDO $connection)
    {
    }

    public function findByEmail(string $email): ?array
    {
        $statement = $this->connection->prepare(
            'SELECT * FROM users WHERE LOWER(email) = LOWER(:email) LIMIT 1'
        );
        $statement->execute(['email' => $email]);
        $user = $statement->fetch();

        return $user ?: null;
    }

    public function findByUsername(string $username): ?array
    {
        $statement = $this->connection->prepare(
            'SELECT * FROM users WHERE LOWER(username) = LOWER(:username) LIMIT 1'
        );
        $statement->execute(['username' => $username]);
        $user = $statement->fetch();

        return $user ?: null;
    }

    public function findById(int $userId): ?array
    {
        $statement = $this->connection->prepare(
            'SELECT * FROM users WHERE user_id = :user_id LIMIT 1'
        );
        $statement->execute(['user_id' => $userId]);
        $user = $statement->fetch();

        return $user ?: null;
    }

    public function findByEmailAndRole(string $email, string $role): ?array
    {
        $statement = $this->connection->prepare(
            'SELECT * FROM users WHERE LOWER(email) = LOWER(:email) AND role = :role LIMIT 1'
        );
        $statement->execute(['email' => $email, 'role' => $role]);
        $user = $statement->fetch();

        return $user ?: null;
    }

    public function all(?string $search = null, ?string $role = null): array
    {
        $sql = 'SELECT * FROM users';
        $conditions = [];
        $parameters = [];

        if ($role !== null && $role !== '') {
            $conditions[] = 'role = :role';
            $parameters['role'] = $role;
        }

        if ($search !== null && $search !== '') {
            $conditions[] = '(username LIKE :search OR email LIKE :search OR full_name LIKE :search OR contact LIKE :search)';
            $parameters['search'] = '%' . $search . '%';
        }

        if ($conditions !== []) {
            $sql .= ' WHERE ' . implode(' AND ', $conditions);
        }

        $sql .= ' ORDER BY user_id DESC';

        $statement = $this->connection->prepare($sql);
        $statement->execute($parameters);

        return $statement->fetchAll();
    }

    public function countByRole(string $role): int
    {
        $statement = $this->connection->prepare('SELECT COUNT(*) AS total FROM users WHERE role = :role');
        $statement->execute(['role' => $role]);

        return (int) $statement->fetchColumn();
    }

    public function countAll(): int
    {
        $statement = $this->connection->query('SELECT COUNT(*) FROM users');

        return (int) $statement->fetchColumn();
    }

    public function recentUsers(int $limit = 5): array
    {
        $statement = $this->connection->prepare(
            'SELECT user_id, username, email, role, created_at FROM users ORDER BY created_at DESC LIMIT :limit'
        );
        $statement->bindValue(':limit', $limit, PDO::PARAM_INT);
        $statement->execute();

        return $statement->fetchAll();
    }

    public function create(array $data): int
    {
        $statement = $this->connection->prepare(
            'INSERT INTO users
                (role, username, email, password_hash, full_name, contact, gender, security_question, security_answer_hash)
             VALUES
                (:role, :username, :email, :password_hash, :full_name, :contact, :gender, :security_question, :security_answer_hash)'
        );
        $statement->execute([
            'role' => $data['role'],
            'username' => $data['username'],
            'email' => $data['email'],
            'password_hash' => password_hash($data['password'], PASSWORD_DEFAULT),
            'full_name' => $data['full_name'] ?? null,
            'contact' => $data['contact'] ?? null,
            'gender' => $data['gender'] ?? null,
            'security_question' => $data['security_question'] ?? null,
            'security_answer_hash' => isset($data['security_answer'])
                ? password_hash(strtolower(trim($data['security_answer'])), PASSWORD_DEFAULT)
                : null,
        ]);

        return (int) $this->connection->lastInsertId();
    }

    public function updateProfile(int $userId, array $data): bool
    {
        $statement = $this->connection->prepare(
            'UPDATE users
             SET full_name = :full_name, username = :username, email = :email,
                 contact = :contact, gender = :gender
             WHERE user_id = :user_id'
        );

        return $statement->execute([
            'user_id' => $userId,
            'full_name' => $data['full_name'] ?? null,
            'username' => $data['username'],
            'email' => $data['email'],
            'contact' => $data['contact'] ?? null,
            'gender' => $data['gender'] ?? null,
        ]);
    }

    public function updateUser(int $userId, array $data): bool
    {
        $sql = 'UPDATE users SET username = :username, email = :email, full_name = :full_name, contact = :contact, gender = :gender';
        $parameters = [
            'user_id' => $userId,
            'username' => $data['username'],
            'email' => strtolower(trim((string) ($data['email'] ?? ''))),
            'full_name' => $data['full_name'] ?? null,
            'contact' => $data['contact'] ?? null,
            'gender' => $data['gender'] ?? null,
        ];

        if (isset($data['password']) && trim((string) $data['password']) !== '') {
            $sql .= ', password_hash = :password_hash';
            $parameters['password_hash'] = password_hash((string) $data['password'], PASSWORD_DEFAULT);
        }

        $sql .= ' WHERE user_id = :user_id';

        $statement = $this->connection->prepare($sql);

        return $statement->execute($parameters);
    }

    public function deleteById(int $userId): bool
    {
        $statement = $this->connection->prepare('DELETE FROM users WHERE user_id = :user_id');

        return $statement->execute(['user_id' => $userId]);
    }

    public function changePassword(int $userId, string $password): bool
    {
        $statement = $this->connection->prepare(
            'UPDATE users SET password_hash = :password_hash WHERE user_id = :user_id'
        );

        return $statement->execute([
            'user_id' => $userId,
            'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        ]);
    }
}
