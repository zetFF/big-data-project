<?php

namespace App\Services;

use App\Models\Vendor;
use App\Models\PurchaseOrder;
use App\Models\Product;
use App\Models\VendorPerformance;
use App\Models\VendorContract;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class VendorManagementService
{
    public function evaluateVendorPerformance(Vendor $vendor): array
    {
        $metrics = [
            'delivery_performance' => $this->calculateDeliveryPerformance($vendor),
            'quality_metrics' => $this->calculateQualityMetrics($vendor),
            'price_competitiveness' => $this->analyzePriceCompetitiveness($vendor),
            'response_time' => $this->calculateResponseTime($vendor),
            'payment_history' => $this->analyzePaymentHistory($vendor)
        ];

        VendorPerformance::create([
            'vendor_id' => $vendor->id,
            'metrics' => $metrics,
            'overall_score' => $this->calculateOverallScore($metrics)
        ]);

        return $metrics;
    }

    public function createPurchaseOrder(Vendor $vendor, array $items, array $metadata = []): PurchaseOrder
    {
        $po = PurchaseOrder::create([
            'vendor_id' => $vendor->id,
            'order_number' => $this->generatePONumber(),
            'status' => 'draft',
            'expected_delivery_date' => $metadata['expected_delivery_date'] ?? null,
            'payment_terms' => $metadata['payment_terms'] ?? $vendor->default_payment_terms,
            'shipping_terms' => $metadata['shipping_terms'] ?? $vendor->default_shipping_terms,
            'notes' => $metadata['notes'] ?? null
        ]);

        foreach ($items as $item) {
            $po->items()->create([
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'unit_price' => $this->negotiatePrice($vendor, Product::find($item['product_id']), $item['quantity']),
                'tax_rate' => $item['tax_rate'] ?? $vendor->default_tax_rate
            ]);
        }

        return $po;
    }

    public function manageContracts(Vendor $vendor, array $contractData): VendorContract
    {
        $contract = VendorContract::create([
            'vendor_id' => $vendor->id,
            'start_date' => $contractData['start_date'],
            'end_date' => $contractData['end_date'],
            'terms' => $contractData['terms'],
            'payment_terms' => $contractData['payment_terms'],
            'minimum_order_value' => $contractData['minimum_order_value'] ?? null,
            'volume_discounts' => $contractData['volume_discounts'] ?? [],
            'penalty_clauses' => $contractData['penalty_clauses'] ?? [],
            'renewal_terms' => $contractData['renewal_terms'] ?? null
        ]);

        if (isset($contractData['products'])) {
            foreach ($contractData['products'] as $product) {
                $contract->products()->attach($product['id'], [
                    'agreed_price' => $product['price'],
                    'minimum_quantity' => $product['minimum_quantity'] ?? null,
                    'lead_time' => $product['lead_time'] ?? null
                ]);
            }
        }

        return $contract;
    }

    private function calculateDeliveryPerformance(Vendor $vendor): array
    {
        $orders = PurchaseOrder::where('vendor_id', $vendor->id)
            ->where('status', 'completed')
            ->where('created_at', '>=', now()->subMonths(6))
            ->get();

        $onTimeDeliveries = $orders->filter(function ($order) {
            return $order->delivery_date <= $order->expected_delivery_date;
        })->count();

        $totalOrders = $orders->count();

        return [
            'on_time_delivery_rate' => $totalOrders > 0 ? ($onTimeDeliveries / $totalOrders) * 100 : 0,
            'average_delay' => $orders->where('delivery_date', '>', 'expected_delivery_date')
                ->avg('delivery_delay_days') ?? 0,
            'perfect_order_rate' => $this->calculatePerfectOrderRate($orders)
        ];
    }

    private function calculateQualityMetrics(Vendor $vendor): array
    {
        $receivedItems = $vendor->purchaseOrders()
            ->with('items')
            ->where('status', 'completed')
            ->where('created_at', '>=', now()->subMonths(6))
            ->get()
            ->pluck('items')
            ->flatten();

        $defectRate = $receivedItems->where('quality_issue', true)->count() / max(1, $receivedItems->count());
        
        return [
            'defect_rate' => $defectRate * 100,
            'quality_rating' => 5 - ($defectRate * 5),
            'return_rate' => $this->calculateReturnRate($vendor),
            'quality_incidents' => $vendor->qualityIncidents()
                ->where('created_at', '>=', now()->subMonths(6))
                ->count()
        ];
    }

    private function analyzePriceCompetitiveness(Vendor $vendor): array
    {
        $competitiveAnalysis = [];
        
        foreach ($vendor->products as $product) {
            $marketPrices = Product::where('category_id', $product->category_id)
                ->where('id', '!=', $product->id)
                ->pluck('price');

            $competitiveAnalysis[$product->id] = [
                'vendor_price' => $product->pivot->price,
                'market_average' => $marketPrices->avg(),
                'price_difference_percentage' => $marketPrices->avg() > 0 
                    ? (($product->pivot->price - $marketPrices->avg()) / $marketPrices->avg()) * 100 
                    : 0
            ];
        }

        return [
            'price_competitiveness_score' => $this->calculatePriceCompetitivenessScore($competitiveAnalysis),
            'price_trends' => $this->analyzePriceTrends($vendor),
            'savings_achieved' => $this->calculateSavingsAchieved($vendor),
            'detailed_analysis' => $competitiveAnalysis
        ];
    }

    private function calculateResponseTime(Vendor $vendor): array
    {
        $inquiries = $vendor->inquiries()
            ->where('created_at', '>=', now()->subMonths(3))
            ->get();

        return [
            'average_response_time' => $inquiries->avg('response_time_hours') ?? 0,
            'response_rate' => $inquiries->whereNotNull('responded_at')->count() / max(1, $inquiries->count()) * 100,
            'resolution_time' => $inquiries->avg('resolution_time_hours') ?? 0
        ];
    }

    private function analyzePaymentHistory(Vendor $vendor): array
    {
        $payments = $vendor->payments()
            ->where('created_at', '>=', now()->subMonths(6))
            ->get();

        return [
            'payment_accuracy' => $this->calculatePaymentAccuracy($payments),
            'average_payment_delay' => $payments->where('paid_at', '>', 'due_date')
                ->avg('payment_delay_days') ?? 0,
            'early_payment_discount_utilization' => $this->calculateEarlyPaymentDiscountRate($payments)
        ];
    }

    private function calculateOverallScore(array $metrics): float
    {
        $weights = [
            'delivery_performance' => 0.3,
            'quality_metrics' => 0.25,
            'price_competitiveness' => 0.2,
            'response_time' => 0.15,
            'payment_history' => 0.1
        ];

        $score = 0;
        foreach ($metrics as $metric => $value) {
            $score += $this->normalizeMetricScore($metric, $value) * $weights[$metric];
        }

        return round($score, 2);
    }

    private function generatePONumber(): string
    {
        return 'PO-' . date('Ymd') . '-' . strtoupper(uniqid());
    }

    private function negotiatePrice(Vendor $vendor, Product $product, int $quantity): float
    {
        $basePrice = $vendor->products()
            ->where('product_id', $product->id)
            ->first()
            ->pivot
            ->price;

        $contract = $vendor->currentContract;
        if (!$contract) return $basePrice;

        // Apply volume discounts
        foreach ($contract->volume_discounts as $discount) {
            if ($quantity >= $discount['minimum_quantity']) {
                $basePrice *= (1 - $discount['discount_percentage'] / 100);
                break;
            }
        }

        return $basePrice;
    }
} 