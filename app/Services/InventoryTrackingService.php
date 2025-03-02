<?php

namespace App\Services;

use App\Models\Product;
use App\Models\InventoryMovement;
use App\Models\StockAlert;
use App\Events\LowStockAlert;
use Illuminate\Support\Facades\DB;

class InventoryTrackingService
{
    public function adjustStock(Product $product, int $quantity, string $type, string $reason): void
    {
        DB::transaction(function () use ($product, $quantity, $type, $reason) {
            // Record movement
            InventoryMovement::create([
                'product_id' => $product->id,
                'quantity' => $quantity,
                'type' => $type,
                'reason' => $reason,
                'previous_stock' => $product->stock
            ]);

            // Update product stock
            $newStock = $type === 'addition' 
                ? $product->stock + $quantity 
                : $product->stock - $quantity;

            $product->update(['stock' => $newStock]);

            // Check low stock threshold
            $this->checkLowStockAlert($product);
        });
    }

    public function checkLowStockAlert(Product $product): void
    {
        if ($product->stock <= $product->low_stock_threshold) {
            event(new LowStockAlert($product));

            StockAlert::create([
                'product_id' => $product->id,
                'current_stock' => $product->stock,
                'threshold' => $product->low_stock_threshold
            ]);
        }
    }

    public function getStockHistory(Product $product)
    {
        return InventoryMovement::where('product_id', $product->id)
            ->latest()
            ->paginate(15);
    }

    public function getForecastedStockNeeds(): array
    {
        $products = Product::with(['orderItems' => function ($query) {
            $query->whereHas('order', function ($q) {
                $q->where('created_at', '>=', now()->subMonths(3));
            });
        }])->get();

        $forecasts = [];
        foreach ($products as $product) {
            $avgMonthlyDemand = $product->orderItems->sum('quantity') / 3;
            $weeksUntilStockout = $product->stock / ($avgMonthlyDemand / 4);
            
            $forecasts[] = [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'current_stock' => $product->stock,
                'avg_monthly_demand' => $avgMonthlyDemand,
                'weeks_until_stockout' => $weeksUntilStockout,
                'reorder_suggested' => $weeksUntilStockout <= 4
            ];
        }

        return $forecasts;
    }
} 