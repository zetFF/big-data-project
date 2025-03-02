<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ComparisonList;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class ComparisonService
{
    public function addToComparison(string $sessionId, Product $product): void
    {
        $comparisonList = $this->getComparisonList($sessionId);
        
        // Check if product is from same category
        if ($comparisonList->isNotEmpty() && 
            $comparisonList->first()->category_id !== $product->category_id) {
            throw new \Exception('Can only compare products from the same category');
        }

        // Limit to 4 products
        if ($comparisonList->count() >= 4) {
            throw new \Exception('Cannot compare more than 4 products');
        }

        Cache::put(
            "comparison:{$sessionId}",
            $comparisonList->push($product)->unique('id'),
            now()->addHours(24)
        );
    }

    public function removeFromComparison(string $sessionId, int $productId): void
    {
        $comparisonList = $this->getComparisonList($sessionId);
        
        Cache::put(
            "comparison:{$sessionId}",
            $comparisonList->reject(fn($product) => $product->id === $productId),
            now()->addHours(24)
        );
    }

    public function getComparisonList(string $sessionId): Collection
    {
        return Cache::get("comparison:{$sessionId}", collect());
    }

    public function getComparisonData(Collection $products): array
    {
        if ($products->isEmpty()) {
            return [];
        }

        $specifications = $this->getSpecifications($products);
        $features = $this->getFeatures($products);
        
        return [
            'specifications' => $specifications,
            'features' => $features,
            'price_comparison' => $this->getPriceComparison($products),
            'rating_comparison' => $this->getRatingComparison($products),
            'stock_status' => $this->getStockStatus($products),
            'shipping_info' => $this->getShippingInfo($products)
        ];
    }

    private function getSpecifications(Collection $products): array
    {
        $specs = [];
        
        foreach ($products as $product) {
            foreach ($product->specifications as $key => $value) {
                if (!isset($specs[$key])) {
                    $specs[$key] = [];
                }
                $specs[$key][$product->id] = $value;
            }
        }

        return $specs;
    }

    private function getFeatures(Collection $products): array
    {
        $allFeatures = $products->pluck('features')->flatten()->unique();
        
        $comparison = [];
        foreach ($allFeatures as $feature) {
            $comparison[$feature] = [];
            foreach ($products as $product) {
                $comparison[$feature][$product->id] = in_array($feature, $product->features);
            }
        }

        return $comparison;
    }

    private function getPriceComparison(Collection $products): array
    {
        return [
            'current_prices' => $products->pluck('price', 'id'),
            'original_prices' => $products->pluck('base_price', 'id'),
            'discounts' => $products->map(function ($product) {
                $discount = $product->base_price - $product->price;
                return [
                    'amount' => $discount,
                    'percentage' => ($discount / $product->base_price) * 100
                ];
            })->all()
        ];
    }

    private function getRatingComparison(Collection $products): array
    {
        return $products->map(function ($product) {
            return [
                'average_rating' => $product->average_rating,
                'total_reviews' => $product->total_reviews,
                'rating_distribution' => $product->rating_distribution
            ];
        })->all();
    }
} 