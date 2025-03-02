<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\BulkOrder;
use App\Models\Discount;
use App\Events\BulkOrderCreated;
use App\Notifications\BulkOrderConfirmation;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class BulkOrderService
{
    protected $inventoryService;

    public function __construct(InventoryManagementService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    public function createBulkOrder(array $orderData, array $items): BulkOrder
    {
        return DB::transaction(function () use ($orderData, $items) {
            $bulkOrder = BulkOrder::create([
                'user_id' => $orderData['user_id'],
                'company_name' => $orderData['company_name'],
                'status' => 'pending',
                'expected_delivery_date' => $orderData['expected_delivery_date'],
                'shipping_address' => $orderData['shipping_address'],
                'billing_address' => $orderData['billing_address'],
                'payment_terms' => $orderData['payment_terms'] ?? 'net_30',
                'notes' => $orderData['notes'] ?? null,
                'po_number' => $orderData['po_number'] ?? null
            ]);

            $totalAmount = 0;
            foreach ($items as $item) {
                $product = Product::findOrFail($item['product_id']);
                $quantity = $item['quantity'];
                
                // Calculate tiered pricing
                $unitPrice = $this->calculateTieredPrice($product, $quantity);
                $amount = $unitPrice * $quantity;
                
                $bulkOrder->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => $amount,
                    'estimated_delivery_date' => $this->calculateEstimatedDelivery($product, $quantity)
                ]);

                $totalAmount += $amount;
            }

            // Apply volume discounts
            $discount = $this->calculateVolumeDiscount($totalAmount);
            $bulkOrder->update([
                'subtotal' => $totalAmount,
                'discount_amount' => $discount,
                'total_amount' => $totalAmount - $discount
            ]);

            // Check inventory and create allocation plan
            $this->createAllocationPlan($bulkOrder);

            // Trigger events and notifications
            event(new BulkOrderCreated($bulkOrder));
            $bulkOrder->user->notify(new BulkOrderConfirmation($bulkOrder));

            return $bulkOrder;
        });
    }

    private function calculateTieredPrice(Product $product, int $quantity): float
    {
        $tiers = $product->priceTiers()
            ->where('min_quantity', '<=', $quantity)
            ->orderBy('min_quantity', 'desc')
            ->first();

        return $tiers ? $tiers->unit_price : $product->price;
    }

    private function calculateVolumeDiscount(float $totalAmount): float
    {
        $discounts = Discount::where('type', 'volume')
            ->where('min_amount', '<=', $totalAmount)
            ->orderBy('min_amount', 'desc')
            ->first();

        if (!$discounts) return 0;

        return $totalAmount * ($discounts->percentage / 100);
    }

    private function calculateEstimatedDelivery(Product $product, int $quantity): \Carbon\Carbon
    {
        $baseLeadTime = $product->lead_time ?? 7; // Default 7 days
        $quantityFactor = ceil($quantity / ($product->batch_size ?? 100));
        
        return now()->addDays($baseLeadTime * $quantityFactor);
    }

    private function createAllocationPlan(BulkOrder $bulkOrder): void
    {
        foreach ($bulkOrder->items as $item) {
            try {
                $allocation = $this->inventoryService->allocateStock(
                    $item->product,
                    $item->quantity,
                    ['priority' => 'bulk']
                );

                $item->update(['allocation_plan' => $allocation]);
            } catch (\Exception $e) {
                // Log allocation failure but don't stop the process
                \Log::warning("Allocation failed for bulk order item", [
                    'bulk_order_id' => $bulkOrder->id,
                    'item_id' => $item->id,
                    'error' => $e->getMessage()
                ]);
            }
        }
    }

    public function processBulkOrder(BulkOrder $bulkOrder): void
    {
        DB::transaction(function () use ($bulkOrder) {
            foreach ($bulkOrder->items as $item) {
                // Process inventory allocation
                if ($item->allocation_plan) {
                    foreach ($item->allocation_plan as $allocation) {
                        $this->inventoryService->adjustStock(
                            $item->product,
                            -$allocation['quantity'],
                            'bulk_order',
                            [
                                'bulk_order_id' => $bulkOrder->id,
                                'warehouse_id' => $allocation['warehouse_id']
                            ]
                        );
                    }
                }

                // Update product statistics
                $item->product->increment('bulk_orders_count');
                $item->product->increment('bulk_orders_quantity', $item->quantity);
            }

            $bulkOrder->update(['status' => 'processing']);
        });
    }

    public function getBulkOrderAnalytics(array $filters = []): array
    {
        $query = BulkOrder::query();

        if (isset($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        $orders = $query->get();

        return [
            'total_orders' => $orders->count(),
            'total_revenue' => $orders->sum('total_amount'),
            'average_order_value' => $orders->avg('total_amount'),
            'total_items' => $orders->sum(function ($order) {
                return $order->items->sum('quantity');
            }),
            'status_distribution' => $orders->groupBy('status')
                ->map(fn($group) => $group->count()),
            'top_products' => $this->getTopProducts($orders),
            'monthly_trends' => $this->getMonthlyTrends($orders)
        ];
    }

    private function getTopProducts(Collection $orders): Collection
    {
        return $orders->flatMap(fn($order) => $order->items)
            ->groupBy('product_id')
            ->map(function ($items) {
                $product = $items->first()->product;
                return [
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'total_quantity' => $items->sum('quantity'),
                    'total_revenue' => $items->sum('total_price')
                ];
            })
            ->sortByDesc('total_revenue')
            ->take(10);
    }

    private function getMonthlyTrends(Collection $orders): array
    {
        return $orders->groupBy(function ($order) {
            return $order->created_at->format('Y-m');
        })->map(function ($monthOrders) {
            return [
                'order_count' => $monthOrders->count(),
                'total_revenue' => $monthOrders->sum('total_amount'),
                'average_order_value' => $monthOrders->avg('total_amount')
            ];
        })->toArray();
    }
} 