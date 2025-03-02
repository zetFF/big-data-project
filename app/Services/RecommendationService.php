<?php

namespace App\Services;

use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class RecommendationService
{
    public function getPersonalizedRecommendations(User $user, int $limit = 10): Collection
    {
        // Get user's purchase history
        $purchasedCategories = $user->orders()
            ->with('items.product.category')
            ->get()
            ->pluck('items.*.product.category_id')
            ->flatten()
            ->unique();

        // Get user's viewed products
        $viewedProducts = $user->productViews()
            ->whereBetween('viewed_at', [now()->subDays(30), now()])
            ->pluck('product_id');

        // Combine collaborative and content-based filtering
        return Product::query()
            ->whereIn('category_id', $purchasedCategories)
            ->whereNotIn('id', $viewedProducts)
            ->where('stock', '>', 0)
            ->orderBy('average_rating', 'desc')
            ->take($limit)
            ->get();
    }

    public function getSimilarProducts(Product $product, int $limit = 6): Collection
    {
        return Product::query()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('stock', '>', 0)
            ->orderBy(DB::raw('ABS(price - ' . $product->price . ')'))
            ->take($limit)
            ->get();
    }

    public function getFrequentlyBoughtTogether(Product $product): Collection
    {
        return DB::table('order_items as oi1')
            ->join('order_items as oi2', 'oi1.order_id', '=', 'oi2.order_id')
            ->join('products', 'oi2.product_id', '=', 'products.id')
            ->where('oi1.product_id', $product->id)
            ->where('oi2.product_id', '!=', $product->id)
            ->select('products.*', DB::raw('COUNT(*) as frequency'))
            ->groupBy('products.id')
            ->orderByDesc('frequency')
            ->limit(4)
            ->get();
    }

    public function getTrendingProducts(): Collection
    {
        return Product::query()
            ->where('stock', '>', 0)
            ->orderBy('view_count', 'desc')
            ->orderBy('average_rating', 'desc')
            ->take(8)
            ->get();
    }

    public function recordProductView(User $user, Product $product): void
    {
        $user->productViews()->updateOrCreate(
            ['product_id' => $product->id],
            ['viewed_at' => now()]
        );

        $product->increment('view_count');
    }

    private function calculateProductSimilarity(Product $product1, Product $product2): float
    {
        $score = 0;
        
        // Category similarity
        if ($product1->category_id === $product2->category_id) {
            $score += 0.3;
        }

        // Price similarity (normalized)
        $priceDiff = abs($product1->price - $product2->price);
        $maxPrice = max($product1->price, $product2->price);
        $score += 0.3 * (1 - ($priceDiff / $maxPrice));

        // Tag similarity
        $commonTags = array_intersect(
            $product1->tags->pluck('name')->toArray(),
            $product2->tags->pluck('name')->toArray()
        );
        $score += 0.4 * (count($commonTags) / max(
            count($product1->tags),
            count($product2->tags)
        ));

        return $score;
    }
} 