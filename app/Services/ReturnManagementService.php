<?php

namespace App\Services;

use App\Models\Order;
use App\Models\ReturnRequest;
use App\Models\ReturnItem;
use App\Models\Product;
use App\Models\Refund;
use App\Events\ReturnRequestCreated;
use App\Events\ReturnRequestApproved;
use App\Events\ReturnRequestRejected;
use App\Notifications\ReturnRequestStatus;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReturnManagementService
{
    protected $inventoryService;

    public function __construct(InventoryManagementService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    public function createReturnRequest(Order $order, array $items, array $data): ReturnRequest
    {
        return DB::transaction(function () use ($order, $items, $data) {
            $returnRequest = ReturnRequest::create([
                'order_id' => $order->id,
                'user_id' => $order->user_id,
                'reason' => $data['reason'],
                'status' => 'pending',
                'return_method' => $data['return_method'],
                'notes' => $data['notes'] ?? null,
                'requested_refund_method' => $data['refund_method']
            ]);

            $totalRefundAmount = 0;

            foreach ($items as $item) {
                $orderItem = $order->items()->findOrFail($item['order_item_id']);
                
                // Validate return eligibility
                $this->validateReturnEligibility($orderItem);

                $refundAmount = $this->calculateRefundAmount($orderItem, $item['quantity']);
                $totalRefundAmount += $refundAmount;

                $returnRequest->items()->create([
                    'order_item_id' => $orderItem->id,
                    'product_id' => $orderItem->product_id,
                    'quantity' => $item['quantity'],
                    'reason_detail' => $item['reason'] ?? null,
                    'condition' => $item['condition'] ?? 'unused',
                    'refund_amount' => $refundAmount
                ]);
            }

            $returnRequest->update([
                'total_refund_amount' => $totalRefundAmount
            ]);

            event(new ReturnRequestCreated($returnRequest));
            
            return $returnRequest;
        });
    }

    public function approveReturn(ReturnRequest $returnRequest, array $data): void
    {
        DB::transaction(function () use ($returnRequest, $data) {
            $returnRequest->update([
                'status' => 'approved',
                'approved_at' => now(),
                'approved_by' => auth()->id(),
                'return_label' => $data['return_label'] ?? null,
                'return_instructions' => $data['return_instructions'] ?? null
            ]);

            // Generate return label if needed
            if ($returnRequest->return_method === 'shipping') {
                $this->generateReturnLabel($returnRequest);
            }

            event(new ReturnRequestApproved($returnRequest));
            $returnRequest->user->notify(new ReturnRequestStatus($returnRequest));
        });
    }

    public function processReturnedItems(ReturnRequest $returnRequest, array $receivedItems): void
    {
        DB::transaction(function () use ($returnRequest, $receivedItems) {
            foreach ($receivedItems as $itemData) {
                $returnItem = $returnRequest->items()->findOrFail($itemData['return_item_id']);
                
                $returnItem->update([
                    'received_quantity' => $itemData['received_quantity'],
                    'received_condition' => $itemData['condition'],
                    'inspection_notes' => $itemData['notes'] ?? null,
                    'processed_at' => now()
                ]);

                // Update inventory based on item condition
                if ($itemData['condition'] === 'resellable') {
                    $this->inventoryService->adjustStock(
                        $returnItem->product,
                        $itemData['received_quantity'],
                        'return',
                        ['return_request_id' => $returnRequest->id]
                    );
                }
            }

            // Process refund
            if ($returnRequest->requested_refund_method === 'original_payment') {
                $this->processRefund($returnRequest);
            } else {
                $this->issueStoreCredit($returnRequest);
            }

            $returnRequest->update([
                'status' => 'completed',
                'completed_at' => now()
            ]);
        });
    }

    public function rejectReturn(ReturnRequest $returnRequest, array $data): void
    {
        $returnRequest->update([
            'status' => 'rejected',
            'rejection_reason' => $data['reason'],
            'rejected_at' => now(),
            'rejected_by' => auth()->id()
        ]);

        event(new ReturnRequestRejected($returnRequest));
        $returnRequest->user->notify(new ReturnRequestStatus($returnRequest));
    }

    private function validateReturnEligibility($orderItem): void
    {
        $returnWindow = config('shop.return_window_days', 30);
        $orderDate = $orderItem->order->created_at;

        if ($orderDate->addDays($returnWindow) < now()) {
            throw new \Exception('Item is no longer eligible for return');
        }

        if ($orderItem->returned_quantity >= $orderItem->quantity) {
            throw new \Exception('All items have already been returned');
        }
    }

    private function calculateRefundAmount($orderItem, $quantity): float
    {
        $unitRefund = $orderItem->unit_price;
        
        // Deduct return shipping fee if applicable
        if (config('shop.customer_pays_return_shipping', true)) {
            $unitRefund -= config('shop.return_shipping_fee', 0);
        }

        // Apply restocking fee if applicable
        $restockingFee = config('shop.restocking_fee_percentage', 0);
        if ($restockingFee > 0) {
            $unitRefund *= (1 - $restockingFee / 100);
        }

        return $unitRefund * $quantity;
    }

    private function generateReturnLabel(ReturnRequest $returnRequest): void
    {
        // Implementation for generating return shipping label
        // This would typically integrate with a shipping carrier's API
    }

    private function processRefund(ReturnRequest $returnRequest): void
    {
        $refund = Refund::create([
            'return_request_id' => $returnRequest->id,
            'amount' => $returnRequest->total_refund_amount,
            'method' => $returnRequest->requested_refund_method,
            'status' => 'pending'
        ]);

        // Process refund through payment gateway
        try {
            // Payment gateway integration here
            $refund->update(['status' => 'completed']);
        } catch (\Exception $e) {
            $refund->update(['status' => 'failed']);
            throw $e;
        }
    }

    private function issueStoreCredit(ReturnRequest $returnRequest): void
    {
        $returnRequest->user->increment('store_credit', $returnRequest->total_refund_amount);
    }

    public function getReturnAnalytics(array $filters = []): array
    {
        $query = ReturnRequest::query();

        if (isset($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        $returns = $query->get();

        return [
            'total_returns' => $returns->count(),
            'total_refunded' => $returns->where('status', 'completed')
                ->sum('total_refund_amount'),
            'return_rate' => $this->calculateReturnRate($returns),
            'average_processing_time' => $this->calculateAverageProcessingTime($returns),
            'common_reasons' => $this->analyzeReturnReasons($returns),
            'product_return_rates' => $this->analyzeProductReturnRates($returns),
            'monthly_trends' => $this->getMonthlyReturnTrends($returns)
        ];
    }

    private function calculateReturnRate(Collection $returns): float
    {
        $totalOrders = Order::whereBetween('created_at', [
            $returns->min('created_at'),
            $returns->max('created_at')
        ])->count();

        return $totalOrders > 0 ? ($returns->count() / $totalOrders) * 100 : 0;
    }

    private function calculateAverageProcessingTime(Collection $returns): float
    {
        return $returns->where('status', 'completed')
            ->avg(function ($return) {
                return $return->completed_at->diffInHours($return->created_at);
            }) ?? 0;
    }

    private function analyzeReturnReasons(Collection $returns): array
    {
        return $returns->groupBy('reason')
            ->map(fn($group) => [
                'count' => $group->count(),
                'percentage' => ($group->count() / $returns->count()) * 100
            ])
            ->sortByDesc('count')
            ->take(5)
            ->toArray();
    }

    private function analyzeProductReturnRates(Collection $returns): Collection
    {
        return $returns->flatMap(fn($return) => $return->items)
            ->groupBy('product_id')
            ->map(function ($items) {
                $product = $items->first()->product;
                $totalSold = $product->total_sold;
                $totalReturned = $items->sum('quantity');

                return [
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'total_returned' => $totalReturned,
                    'return_rate' => $totalSold > 0 ? ($totalReturned / $totalSold) * 100 : 0
                ];
            })
            ->sortByDesc('return_rate')
            ->take(10);
    }

    private function getMonthlyReturnTrends(Collection $returns): array
    {
        return $returns->groupBy(function ($return) {
            return $return->created_at->format('Y-m');
        })->map(function ($monthReturns) {
            return [
                'count' => $monthReturns->count(),
                'total_refunded' => $monthReturns->sum('total_refund_amount'),
                'average_refund' => $monthReturns->avg('total_refund_amount')
            ];
        })->toArray();
    }

    public function processReturn(ReturnRequest $returnRequest)
    {
        DB::beginTransaction();
        
        try {
            // Proses refund
            $this->processRefund($returnRequest);
            
            // Update inventory
            $this->updateInventory($returnRequest);
            
            // Update status return
            $returnRequest->update(['status' => 'completed']);
            
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
} 