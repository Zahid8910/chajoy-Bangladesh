<?php
declare(strict_types=1);

final class ProfileController
{
    public function __construct(private User $users)
    {
    }

    public function show(int $userId): ?array
    {
        return $this->users->findById($userId);
    }

    public function update(int $userId, array $data): bool
    {
        return $this->users->updateProfile($userId, $data);
    }

    public function changePassword(int $userId, string $password): bool
    {
        return $this->users->changePassword($userId, $password);
    }
}
