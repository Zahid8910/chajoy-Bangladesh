<?php
declare(strict_types=1);

final class Review
{
    public function __construct(private PDO $connection)
    {
    }

    public function create(int $customerId, ?int $branchId, ?int $orderId, int $rating, ?string $reviewText): int
    {
        if ($rating < 1 || $rating > 5) {
            throw new InvalidArgumentException('Review rating must be between 1 and 5.');
        }

        $statement = $this->connection->prepare(
            'INSERT INTO reviews (customer_id, branch_id, order_id, rating, review_text)
             VALUES (:customer_id, :branch_id, :order_id, :rating, :review_text)'
        );
        $statement->execute([
            'customer_id' => $customerId,
            'branch_id' => $branchId,
            'order_id' => $orderId,
            'rating' => $rating,
            'review_text' => $reviewText,
        ]);

        return (int) $this->connection->lastInsertId();
    }

    public function published(): array
    {
        return $this->connection->query(
            "SELECT r.*, u.username, b.name AS branch_name
             FROM reviews r
             INNER JOIN users u ON u.user_id = r.customer_id
             LEFT JOIN branches b ON b.branch_id = r.branch_id
             WHERE r.status = 'published'
             ORDER BY r.created_at DESC"
        )->fetchAll();
    }
}
