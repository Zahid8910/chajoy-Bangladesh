<?php

declare(strict_types=1);

final class AdminController
{
    public function __construct(
        private User $users,
        private MenuItem $menuItems,
        private Branch $branches
    ) {
    }

    public function dashboard(int $adminUserId): array
    {
        $stats = [
            'total_users' => $this->users->countAll(),
            'admins' => $this->users->countByRole('admin'),
            'employees' => $this->users->countByRole('employee'),
            'customers' => $this->users->countByRole('customer'),
            'menu_items' => 0,
            'branches' => count($this->branches->all()),
            'recent_users' => $this->users->recentUsers(5),
            'profile' => $this->users->findById($adminUserId) ?: null,
        ];

        $menuStats = $this->menuItems->countAll();
        $stats['menu_items'] = $menuStats;

        return $stats;
    }

    public function profile(int $userId): ?array
    {
        $user = $this->users->findById($userId);
        if ($user === null) {
            return null;
        }

        unset($user['password_hash'], $user['security_answer_hash']);

        return $user;
    }

    public function updateProfile(int $userId, array $data): array
    {
        $email = strtolower(trim((string) ($data['email'] ?? '')));
        $username = trim((string) ($data['username'] ?? ''));
        $fullName = trim((string) ($data['full_name'] ?? ''));
        $contact = trim((string) ($data['contact'] ?? ''));
        $gender = trim((string) ($data['gender'] ?? ''));
        $password = trim((string) ($data['password'] ?? ''));

        if ($username === '' || $email === '') {
            return ['success' => false, 'message' => 'Username and email are required.'];
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['success' => false, 'message' => 'Please enter a valid email address.'];
        }

        $existingUser = $this->users->findByEmail($email);
        if ($existingUser !== null && (int) $existingUser['user_id'] !== $userId) {
            return ['success' => false, 'message' => 'That email is already in use.'];
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

        $updated = $this->users->updateUser($userId, $payload);

        return [
            'success' => $updated,
            'message' => $updated ? 'Profile updated successfully.' : 'Profile update failed.',
        ];
    }

    public function users(?string $search = null, ?string $role = null): array
    {
        return $this->users->all($search, $role);
    }

    public function addUser(array $data): array
    {
        $role = strtolower(trim((string) ($data['role'] ?? '')));
        $username = trim((string) ($data['username'] ?? ''));
        $email = strtolower(trim((string) ($data['email'] ?? '')));
        $password = (string) ($data['password'] ?? '');
        $fullName = trim((string) ($data['full_name'] ?? ''));
        $contact = trim((string) ($data['contact'] ?? ''));
        $gender = trim((string) ($data['gender'] ?? ''));

        if (!in_array($role, ['employee', 'customer'], true)) {
            return ['success' => false, 'message' => 'Role must be employee or customer.'];
        }
        if ($username === '' || $email === '' || $password === '') {
            return ['success' => false, 'message' => 'Username, email, and password are required.'];
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['success' => false, 'message' => 'Please enter a valid email address.'];
        }
        if ($this->users->findByEmail($email) !== null) {
            return ['success' => false, 'message' => 'This email is already registered.'];
        }
        if ($this->users->findByUsername($username) !== null) {
            return ['success' => false, 'message' => 'This username is already taken.'];
        }

        $userId = $this->users->create([
            'role' => $role,
            'username' => $username,
            'email' => $email,
            'password' => $password,
            'full_name' => $fullName !== '' ? $fullName : $username,
            'contact' => $contact,
            'gender' => $gender,
            'security_question' => 'What is your favorite food?',
            'security_answer' => 'chajoy',
        ]);

        return ['success' => true, 'message' => 'User added successfully.', 'user_id' => $userId];
    }

    public function updateUser(int $currentAdminId, int $userId, array $data): array
    {
        if ($userId === $currentAdminId) {
            return ['success' => false, 'message' => 'You cannot update your own admin account from here.'];
        }

        $updatedData = [
            'username' => trim((string) ($data['username'] ?? '')),
            'email' => strtolower(trim((string) ($data['email'] ?? ''))),
            'full_name' => trim((string) ($data['full_name'] ?? '')),
            'contact' => trim((string) ($data['contact'] ?? '')),
            'gender' => trim((string) ($data['gender'] ?? '')),
        ];

        if ($updatedData['username'] === '' || $updatedData['email'] === '') {
            return ['success' => false, 'message' => 'Username and email are required.'];
        }

        if (!filter_var($updatedData['email'], FILTER_VALIDATE_EMAIL)) {
            return ['success' => false, 'message' => 'Please enter a valid email address.'];
        }

        $existingUser = $this->users->findByEmail($updatedData['email']);
        if ($existingUser !== null && (int) $existingUser['user_id'] !== $userId) {
            return ['success' => false, 'message' => 'This email is already in use.'];
        }
        $existingUsername = $this->users->findByUsername($updatedData['username']);
        if ($existingUsername !== null && (int) $existingUsername['user_id'] !== $userId) {
            return ['success' => false, 'message' => 'This username is already in use.'];
        }

        if (isset($data['password']) && trim((string) $data['password']) !== '') {
            $updatedData['password'] = (string) $data['password'];
        }

        $updated = $this->users->updateUser($userId, $updatedData);

        return ['success' => $updated, 'message' => $updated ? 'User updated successfully.' : 'Update failed.'];
    }

    public function deleteUser(int $currentAdminId, int $userId): array
    {
        if ($userId === $currentAdminId) {
            return ['success' => false, 'message' => 'You cannot delete your own admin account.'];
        }

        $deleted = $this->users->deleteById($userId);

        return ['success' => $deleted, 'message' => $deleted ? 'User deleted successfully.' : 'Delete failed.'];
    }

    public function menuItems(): array
    {
        $items = $this->menuItems->allForAdmin();

        return array_map(static function (array $item): array {
            return [
                'menu_item_id' => (int) $item['menu_item_id'],
                'name' => $item['name'],
                'category' => $item['category'],
                'description' => $item['description'],
                'price_bdt' => (float) $item['price_bdt'],
                'active' => (int) $item['active'],
                'image_url' => $item['image_url'] ?? '',
            ];
        }, $items);
    }

    public function saveMenuItem(array $data, ?array $uploadedFile): array
    {
        $name = trim((string) ($data['name'] ?? ''));
        $category = strtolower(trim((string) ($data['category'] ?? '')));
        $description = trim((string) ($data['description'] ?? ''));
        $price = (float) ($data['price_bdt'] ?? 0);
        $active = isset($data['active']) ? (int) $data['active'] : 1;
        $imageUrl = (string) ($data['image_url'] ?? '');

        if ($name === '' || !in_array($category, ['sundae', 'tea', 'milk-tea', 'shake', 'ice-cream'], true)) {
            return ['success' => false, 'message' => 'Please provide a valid menu item name and category.'];
        }
        if ($price < 0) {
            return ['success' => false, 'message' => 'Price cannot be negative.'];
        }

        if ($uploadedFile !== null && isset($uploadedFile['tmp_name']) && is_uploaded_file($uploadedFile['tmp_name'])) {
            $targetDir = __DIR__ . '/../../uploads/menu';
            if (!is_dir($targetDir)) {
                mkdir($targetDir, 0777, true);
            }

            $originalName = preg_replace('/[^A-Za-z0-9._-]/', '-', basename((string) $uploadedFile['name']));
            $safeName = time() . '_' . $originalName;
            $targetFile = $targetDir . '/' . $safeName;

            if (move_uploaded_file($uploadedFile['tmp_name'], $targetFile)) {
                $imageUrl = 'uploads/menu/' . $safeName;
            }
        }

        $menuId = isset($data['menu_item_id']) && $data['menu_item_id'] !== ''
            ? (int) $data['menu_item_id']
            : null;

        if ($menuId !== null) {
            $updated = $this->menuItems->update([
                'menu_item_id' => $menuId,
                'name' => $name,
                'category' => $category,
                'description' => $description,
                'price_bdt' => $price,
                'active' => $active,
                'image_url' => $imageUrl,
            ]);

            return ['success' => $updated, 'message' => $updated ? 'Menu item updated successfully.' : 'Menu item update failed.'];
        }

        $created = $this->menuItems->create([
            'name' => $name,
            'category' => $category,
            'description' => $description,
            'price_bdt' => $price,
            'active' => $active,
            'image_url' => $imageUrl,
        ]);

        return ['success' => $created !== null, 'message' => $created !== null ? 'Menu item added successfully.' : 'Menu item add failed.'];
    }

    public function deleteMenuItem(int $menuItemId): array
    {
        $deleted = $this->menuItems->delete($menuItemId);

        return ['success' => $deleted, 'message' => $deleted ? 'Menu item deleted.' : 'Delete failed.'];
    }

    public function branches(): array
    {
        $branches = $this->branches->all();

        return array_map(static function (array $branch): array {
            return [
                'branch_id' => (int) $branch['branch_id'],
                'name' => $branch['name'],
                'status' => $branch['status'],
                'map_url' => $branch['map_url'] ?? '',
            ];
        }, $branches);
    }

    public function saveBranch(array $data): array
    {
        $branchId = isset($data['branch_id']) && trim((string) $data['branch_id']) !== ''
            ? (int) $data['branch_id']
            : null;
        $name = trim((string) ($data['name'] ?? ''));
        $status = strtolower(trim((string) ($data['status'] ?? 'active')));
        $mapUrl = trim((string) ($data['map_url'] ?? ''));

        if ($name === '') {
            return ['success' => false, 'message' => 'Branch name is required.'];
        }

        if (!in_array($status, ['active', 'upcoming'], true)) {
            $status = 'active';
        }

        if ($branchId !== null) {
            $updated = $this->branches->update($branchId, [
                'name' => $name,
                'status' => $status,
                'map_url' => $mapUrl,
            ]);

            return ['success' => $updated, 'message' => $updated ? 'Branch updated successfully.' : 'Branch update failed.'];
        }

        $created = $this->branches->create([
            'name' => $name,
            'status' => $status,
            'map_url' => $mapUrl,
        ]);

        return ['success' => $created !== null, 'message' => $created !== null ? 'Branch added successfully.' : 'Branch add failed.'];
    }

    public function deleteBranch(int $branchId): array
    {
        $deleted = $this->branches->delete($branchId);

        return ['success' => $deleted, 'message' => $deleted ? 'Branch deleted successfully.' : 'Delete failed.'];
    }
}
