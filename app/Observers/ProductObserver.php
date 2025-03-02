<?php

namespace App\Observers;

use App\Models\Product;
use App\Services\CacheService;

class ProductObserver
{
    public function __construct(
        protected CacheService $cacheService
    ) {}

    public function saved(Product $product)
    {
        $this->cacheService->clearProductCache($product);
    }

    public function deleted(Product $product)
    {
        $this->cacheService->clearProductCache($product);
    }
} 