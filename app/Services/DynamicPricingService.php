<?php

namespace App\Services;

use App\Models\Product;
use App\Models\PriceHistory;
use App\Models\Competitor;
use Illuminate\Support\Facades\Cache;

class DynamicPricingService
{
    public function calculateDynamicPrice(Product $product): float
    {
        $basePrice = $product->base_price;
        $adjustments = 0;

        // Demand-based pricing
        $adjustments += $this->getDemandAdjustment($product);
        
        // Competitor-based pricing
        $adjustments += $this->getCompetitorAdjustment($product);
        
        // Inventory-based pricing
        $adjustments += $this->getInventoryAdjustment($product);
        
        // Time-based pricing
        $adjustments += $this->getTimeBasedAdjustment($product);

        // Calculate final price
        $finalPrice = $basePrice * (1 + $adjustments);
        
        // Ensure price stays within acceptable range
        $minPrice = $basePrice * 0.7; // Maximum 30% discount
        $maxPrice = $basePrice * 1.3; // Maximum 30% markup
        
        $finalPrice = max($minPrice, min($finalPrice, $maxPrice));

        return round($finalPrice, 2);
    }

    private function getDemandAdjustment(Product $product): float
    {
        $viewsLastWeek = $product->view_count_last_week;
        $salesLastWeek = $product->sales_count_last_week;
        
        if ($viewsLastWeek > 1000 && $salesLastWeek > 50) {
            return 0.1; // High demand: +10%
        } elseif ($viewsLastWeek < 100 && $salesLastWeek < 5) {
            return -0.1; // Low demand: -10%
        }
        
        return 0;
    }

    private function getCompetitorAdjustment(Product $product): float
    {
        $competitorPrices = Competitor::where('product_sku', $product->sku)
            ->pluck('price');
            
        if ($competitorPrices->isEmpty()) {
            return 0;
        }

        $avgCompetitorPrice = $competitorPrices->avg();
        $priceDifference = ($product->base_price - $avgCompetitorPrice) / $avgCompetitorPrice;
        
        return -$priceDifference * 0.5; // Adjust 50% towards competitor average
    }

    private function getInventoryAdjustment(Product $product): float
    {
        $stockRatio = $product->stock / $product->optimal_stock;
        
        if ($stockRatio > 1.5) {
            return -0.05; // Excess inventory: -5%
        } elseif ($stockRatio < 0.5) {
            return 0.05; // Low inventory: +5%
        }
        
        return 0;
    }

    private function getTimeBasedAdjustment(Product $product): float
    {
        $adjustment = 0;
        
        // Season-based adjustment
        if ($this->isHighSeason($product)) {
            $adjustment += 0.05;
        }
        
        // Time of day adjustment
        $hour = now()->hour;
        if ($hour >= 18 && $hour <= 22) { // Peak shopping hours
            $adjustment += 0.02;
        }
        
        return $adjustment;
    }

    public function updatePrices(): void
    {
        Product::chunk(100, function ($products) {
            foreach ($products as $product) {
                $newPrice = $this->calculateDynamicPrice($product);
                
                if (abs($newPrice - $product->price) > 0.01) { // Price changed
                    PriceHistory::create([
                        'product_id' => $product->id,
                        'old_price' => $product->price,
                        'new_price' => $newPrice,
                        'reason' => $this->getPriceChangeReason($product, $newPrice)
                    ]);
                    
                    $product->update(['price' => $newPrice]);
                }
            }
        });
    }

    private function getPriceChangeReason(Product $product, float $newPrice): string
    {
        $reasons = [];
        
        if ($product->view_count_last_week > 1000) {
            $reasons[] = 'High demand';
        }
        if ($product->stock > $product->optimal_stock * 1.5) {
            $reasons[] = 'Excess inventory';
        }
        if ($this->isHighSeason($product)) {
            $reasons[] = 'Peak season';
        }
        
        return implode(', ', $reasons) ?: 'Market adjustment';
    }
} 