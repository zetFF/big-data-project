<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use App\Models\Product;
use App\Models\Category;
use App\Models\VendorProfile;

class CacheService
{
    public function clearProductCache(Product $product)
    {
        Cache::tags(['products'])->flush();
        Cache::forget('categories');
        Cache::forget("product_{$product->id}");
    }

    public function getHomePageData()
    {
        return Cache::remember('home_page_data', now()->addHours(6), function () {
            return [
                'featured_products' => Product::with(['category', 'images'])
                    ->where('is_active', true)
                    ->orderBy('created_at', 'desc')
                    ->limit(8)
                    ->get(),
                'categories' => Category::withCount('products')
                    ->having('products_count', '>', 0)
                    ->limit(6)
                    ->get(),
                'top_vendors' => VendorProfile::withCount('products')
                    ->where('status', 'approved')
                    ->orderBy('products_count', 'desc')
                    ->limit(4)
                    ->get(),
            ];
        });
    }

    public function getProductDetails(Product $product)
    {
        return Cache::remember("product_{$product->id}", now()->addDay(), function () use ($product) {
            return $product->load([
                'category',
                'vendor',
                'images',
                'reviews' => function ($query) {
                    $query->with('user')
                        ->latest()
                        ->limit(5);
                },
            ]);
        });
    }
} 