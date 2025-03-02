<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Inventory;
use App\Models\StockMovement;
use App\Models\Warehouse;
use App\Models\PurchaseOrder;
use App\Events\LowStockAlert;
use Illuminate\Support\Collection;
use Carbon\Carbon;

class InventoryManagementService
{
    public function adjustStock(Product $product, int $quantity, string $type, array $metadata = []): void
    {
        $movement = StockMovement::create([
            'product_id' => $product->id,
            'quantity' => $quantity,
            'type' => $type,
            'warehouse_id' => $metadata['warehouse_id'] ?? null,
            'reference_type' => $metadata['reference_type'] ?? null,
            'reference_id' => $metadata['reference_id'] ?? null,
            'notes' => $metadata['notes'] ?? null,
            'batch_number' => $metadata['batch_number'] ?? null,
            'unit_cost' => $metadata['unit_cost'] ?? null
        ]);

        $product->increment('stock', $quantity);
        
        $this->updateAverageCost($product, $quantity, $metadata['unit_cost'] ?? 0);
        $this->checkLowStockAlert($product);
    }

    public function allocateStock(Product $product, int $quantity, array $criteria = []): array
    {
        $allocation = [];
        $remainingQuantity = $quantity;

        // FIFO allocation strategy
        $inventoryBatches = Inventory::where('product_id', $product->id)
            ->where('available_quantity', '>', 0)
            ->orderBy('received_at')
            ->get();

        foreach ($inventoryBatches as $batch) {
            $allocatedQty = min($remainingQuantity, $batch->available_quantity);
            
            if ($allocatedQty > 0) {
                $allocation[] = [
                    'batch_id' => $batch->id,
                    'quantity' => $allocatedQty,
                    'warehouse_id' => $batch->warehouse_id,
                    'batch_number' => $batch->batch_number
                ];

                $batch->decrement('available_quantity', $allocatedQty);
                $remainingQuantity -= $allocatedQty;
            }

            if ($remainingQuantity <= 0) break;
        }

        if ($remainingQuantity > 0) {
            throw new \Exception("Insufficient stock available");
        }

        return $allocation;
    }

    public function forecastDemand(Product $product, int $months = 3): array
    {
        $historicalData = StockMovement::where('product_id', $product->id)
            ->where('type', 'sale')
            ->where('created_at', '>=', now()->subMonths(12))
            ->get()
            ->groupBy(function ($movement) {
                return $movement->created_at->format('Y-m');
            });

        // Calculate average monthly demand
        $monthlyDemand = $historicalData->map(function ($movements) {
            return abs($movements->sum('quantity'));
        })->avg();

        // Calculate seasonal factors
        $seasonalFactors = $this->calculateSeasonalFactors($historicalData);

        // Generate forecast
        $forecast = [];
        $currentDate = now();

        for ($i = 1; $i <= $months; $i++) {
            $forecastDate = $currentDate->copy()->addMonths($i);
            $seasonalFactor = $seasonalFactors[$forecastDate->format('n')] ?? 1;
            
            $forecast[] = [
                'date' => $forecastDate->format('Y-m'),
                'demand' => ceil($monthlyDemand * $seasonalFactor),
                'confidence' => $this->calculateConfidenceScore($historicalData)
            ];
        }

        return $forecast;
    }

    public function optimizeStockLevels(Product $product): array
    {
        $leadTime = $product->supplier_lead_time ?? 14; // days
        $serviceLevelFactor = 2.326; // 99% service level
        
        // Calculate average daily demand
        $dailyDemand = StockMovement::where('product_id', $product->id)
            ->where('type', 'sale')
            ->where('created_at', '>=', now()->subMonths(3))
            ->avg('quantity');

        // Calculate standard deviation of demand
        $demandStdDev = $this->calculateDemandStandardDeviation($product);

        return [
            'reorder_point' => ceil($dailyDemand * $leadTime + $serviceLevelFactor * $demandStdDev * sqrt($leadTime)),
            'safety_stock' => ceil($serviceLevelFactor * $demandStdDev * sqrt($leadTime)),
            'economic_order_quantity' => $this->calculateEOQ($product, $dailyDemand),
            'max_stock_level' => ceil($dailyDemand * $leadTime * 2)
        ];
    }

    private function updateAverageCost(Product $product, int $quantity, float $unitCost): void
    {
        if ($quantity <= 0 || $unitCost <= 0) return;

        $currentStock = $product->stock;
        $currentAvgCost = $product->average_cost ?? 0;

        $newAvgCost = (($currentStock * $currentAvgCost) + ($quantity * $unitCost))
            / ($currentStock + $quantity);

        $product->update(['average_cost' => $newAvgCost]);
    }

    private function checkLowStockAlert(Product $product): void
    {
        $stockLevels = $this->optimizeStockLevels($product);

        if ($product->stock <= $stockLevels['reorder_point']) {
            event(new LowStockAlert($product, $stockLevels));
        }
    }

    private function calculateSeasonalFactors(Collection $historicalData): array
    {
        // Implementation of seasonal decomposition
        $factors = [];
        
        foreach (range(1, 12) as $month) {
            $monthlyData = $historicalData->filter(function ($movements, $date) use ($month) {
                return Carbon::createFromFormat('Y-m', $date)->format('n') == $month;
            });

            $factors[$month] = $monthlyData->isEmpty() ? 1 : 
                $monthlyData->avg() / $historicalData->avg();
        }

        return $factors;
    }

    private function calculateConfidenceScore(Collection $historicalData): float
    {
        // Simple confidence score based on data consistency
        $monthlyVariation = $historicalData->map(function ($movements) {
            return abs($movements->sum('quantity'));
        })->std();

        $meanDemand = $historicalData->map(function ($movements) {
            return abs($movements->sum('quantity'));
        })->avg();

        $coefficientOfVariation = $monthlyVariation / $meanDemand;

        return max(0, min(100, (1 - $coefficientOfVariation) * 100));
    }

    private function calculateEOQ(Product $product, float $dailyDemand): float
    {
        $annualDemand = $dailyDemand * 365;
        $orderingCost = $product->ordering_cost ?? 50; // Default ordering cost
        $holdingCost = $product->holding_cost_percentage ?? 0.2; // 20% of unit cost

        return sqrt((2 * $annualDemand * $orderingCost) / ($product->average_cost * $holdingCost));
    }
} 