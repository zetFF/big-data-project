<?php

namespace App\Services;

use App\Models\Review;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ReviewService
{
    public function createReview(array $data, Product $product, User $user): Review
    {
        // Verify purchase
        $hasPurchased = $user->orders()
            ->whereHas('items', function ($query) use ($product) {
                $query->where('product_id', $product->id);
            })
            ->exists();

        if (!$hasPurchased) {
            throw new \Exception('Only verified purchasers can review this product.');
        }

        $review = Review::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'rating' => $data['rating'],
            'title' => $data['title'] ?? null,
            'content' => $data['content'],
            'verified_purchase' => true
        ]);

        if (isset($data['images'])) {
            foreach ($data['images'] as $image) {
                $review->addMedia($image)
                    ->toMediaCollection('review_images');
            }
        }

        $this->updateProductRating($product);
        return $review;
    }

    public function updateProductRating(Product $product): void
    {
        $metrics = Review::where('product_id', $product->id)
            ->selectRaw('
                COUNT(*) as total_reviews,
                AVG(rating) as average_rating,
                COUNT(CASE WHEN rating >= 4 THEN 1 END) as positive_reviews
            ')
            ->first();

        $product->update([
            'average_rating' => round($metrics->average_rating, 1),
            'total_reviews' => $metrics->total_reviews,
            'positive_reviews_percentage' => $metrics->total_reviews > 0
                ? ($metrics->positive_reviews / $metrics->total_reviews) * 100
                : 0
        ]);
    }

    public function getReviewMetrics(Product $product): array
    {
        return [
            'rating_distribution' => $this->getRatingDistribution($product),
            'sentiment_analysis' => $this->analyzeSentiment($product),
            'review_highlights' => $this->getReviewHighlights($product)
        ];
    }

    private function getRatingDistribution(Product $product): array
    {
        return Review::where('product_id', $product->id)
            ->groupBy('rating')
            ->selectRaw('rating, COUNT(*) as count')
            ->pluck('count', 'rating')
            ->toArray();
    }

    private function getReviewHighlights(Product $product): array
    {
        return Review::where('product_id', $product->id)
            ->where('rating', '>=', 4)
            ->where('helpful_votes', '>', 0)
            ->orderBy('helpful_votes', 'desc')
            ->take(3)
            ->get()
            ->toArray();
    }
} 