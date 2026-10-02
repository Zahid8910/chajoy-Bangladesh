<?php
declare(strict_types=1);

final class ReviewController
{
    public function __construct(private Review $reviews)
    {
    }

    public function create(
        int $customerId,
        ?int $branchId,
        ?int $orderId,
        int $rating,
        ?string $reviewText
    ): int {
        return $this->reviews->create($customerId, $branchId, $orderId, $rating, $reviewText);
    }

    public function published(): array
    {
        return $this->reviews->published();
    }
}
