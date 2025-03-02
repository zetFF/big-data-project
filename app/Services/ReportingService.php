<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\Customer;
use App\Models\ReturnRequest;
use App\Models\Inventory;
use App\Models\Vendor;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportingService
{
    public function generateSalesReport(array $filters = []): array
    {
        $query = Order::query()->with(['items', 'customer']);

        if (isset($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        $orders = $query->get();

        return [
            'summary' => [
                'total_orders' => $orders->count(),
                'total_revenue' => $orders->sum('total_amount'),
                'average_order_value' => $orders->avg('total_amount'),
                'total_items_sold' => $orders->sum(function ($order) {
                    return $order->items->sum('quantity');
                })
            ],
            'trends' => [
                'daily' => $this->getDailySalesTrends($orders),
                'weekly' => $this->getWeeklySalesTrends($orders),
                'monthly' => $this->getMonthlySalesTrends($orders)
            ],
            'top_products' => $this->getTopSellingProducts($orders),
            'customer_segments' => $this->analyzeCustomerSegments($orders),
            'payment_methods' => $this->analyzePaymentMethods($orders),
            'geographical_distribution' => $this->getGeographicalDistribution($orders)
        ];
    }

    public function generateInventoryReport(array $filters = []): array
    {
        $products = Product::with(['inventory', 'stockMovements'])->get();

        return [
            'summary' => [
                'total_products' => $products->count(),
                'total_stock_value' => $products->sum(function ($product) {
                    return $product->stock * $product->average_cost;
                }),
                'low_stock_items' => $products->where('stock', '<=', DB::raw('reorder_point'))->count(),
                'out_of_stock_items' => $products->where('stock', 0)->count()
            ],
            'stock_levels' => $this->analyzeStockLevels($products),
            'inventory_turnover' => $this->calculateInventoryTurnover($products),
            'stock_movements' => $this->analyzeStockMovements($products),
            'warehouse_distribution' => $this->getWarehouseDistribution(),
            'reorder_recommendations' => $this->generateReorderRecommendations($products)
        ];
    }

    public function generateCustomerReport(array $filters = []): array
    {
        $customers = Customer::with(['orders', 'returns'])->get();

        return [
            'summary' => [
                'total_customers' => $customers->count(),
                'active_customers' => $this->getActiveCustomers($customers)->count(),
                'average_customer_value' => $this->calculateAverageCustomerValue($customers),
                'customer_retention_rate' => $this->calculateRetentionRate($customers)
            ],
            'segmentation' => [
                'by_value' => $this->segmentCustomersByValue($customers),
                'by_frequency' => $this->segmentCustomersByFrequency($customers),
                'by_recency' => $this->segmentCustomersByRecency($customers)
            ],
            'lifetime_value' => $this->calculateCustomerLifetimeValue($customers),
            'acquisition_channels' => $this->analyzeAcquisitionChannels($customers),
            'churn_analysis' => $this->analyzeChurnRate($customers)
        ];
    }

    public function generateVendorReport(array $filters = []): array
    {
        $vendors = Vendor::with(['purchaseOrders', 'products'])->get();

        return [
            'summary' => [
                'total_vendors' => $vendors->count(),
                'active_vendors' => $vendors->where('status', 'active')->count(),
                'total_purchase_value' => $vendors->sum(function ($vendor) {
                    return $vendor->purchaseOrders->sum('total_amount');
                })
            ],
            'performance_metrics' => $this->analyzeVendorPerformance($vendors),
            'cost_analysis' => $this->analyzeVendorCosts($vendors),
            'delivery_performance' => $this->analyzeDeliveryPerformance($vendors),
            'quality_metrics' => $this->analyzeQualityMetrics($vendors)
        ];
    }

    private function getDailySalesTrends(Collection $orders): array
    {
        return $orders->groupBy(function ($order) {
            return $order->created_at->format('Y-m-d');
        })->map(function ($dayOrders) {
            return [
                'orders' => $dayOrders->count(),
                'revenue' => $dayOrders->sum('total_amount'),
                'items_sold' => $dayOrders->sum(function ($order) {
                    return $order->items->sum('quantity');
                })
            ];
        })->toArray();
    }

    private function analyzeCustomerSegments(Collection $orders): array
    {
        $customers = $orders->groupBy('customer_id')->map(function ($customerOrders) {
            $totalSpent = $customerOrders->sum('total_amount');
            $orderCount = $customerOrders->count();
            
            return [
                'total_spent' => $totalSpent,
                'order_count' => $orderCount,
                'average_order_value' => $totalSpent / $orderCount,
                'first_order' => $customerOrders->min('created_at'),
                'last_order' => $customerOrders->max('created_at')
            ];
        });

        // RFM Analysis
        return [
            'segments' => [
                'vip' => $customers->filter(function ($customer) {
                    return $customer['total_spent'] >= 1000 && $customer['order_count'] >= 5;
                })->count(),
                'regular' => $customers->filter(function ($customer) {
                    return $customer['total_spent'] >= 500 && $customer['order_count'] >= 3;
                })->count(),
                'occasional' => $customers->filter(function ($customer) {
                    return $customer['total_spent'] >= 100;
                })->count(),
                'one_time' => $customers->filter(function ($customer) {
                    return $customer['order_count'] === 1;
                })->count()
            ],
            'average_values' => [
                'vip' => $customers->filter(function ($customer) {
                    return $customer['total_spent'] >= 1000 && $customer['order_count'] >= 5;
                })->avg('average_order_value'),
                'regular' => $customers->filter(function ($customer) {
                    return $customer['total_spent'] >= 500 && $customer['order_count'] >= 3;
                })->avg('average_order_value'),
                'occasional' => $customers->filter(function ($customer) {
                    return $customer['total_spent'] >= 100;
                })->avg('average_order_value')
            ]
        ];
    }

    private function analyzeStockLevels(Collection $products): array
    {
        return [
            'distribution' => [
                'optimal' => $products->filter(function ($product) {
                    return $product->stock > $product->reorder_point;
                })->count(),
                'low' => $products->filter(function ($product) {
                    return $product->stock <= $product->reorder_point && $product->stock > 0;
                })->count(),
                'out_of_stock' => $products->where('stock', 0)->count()
            ],
            'value_distribution' => [
                'high_value' => $products->filter(function ($product) {
                    return $product->price >= 100;
                })->avg('stock'),
                'medium_value' => $products->filter(function ($product) {
                    return $product->price >= 50 && $product->price < 100;
                })->avg('stock'),
                'low_value' => $products->filter(function ($product) {
                    return $product->price < 50;
                })->avg('stock')
            ]
        ];
    }

    private function calculateInventoryTurnover(Collection $products): array
    {
        $period = now()->subYear();
        
        return $products->map(function ($product) use ($period) {
            $costOfGoodsSold = $product->stockMovements()
                ->where('type', 'sale')
                ->where('created_at', '>=', $period)
                ->sum(DB::raw('quantity * unit_cost'));

            $averageInventory = ($product->stockMovements()
                ->where('created_at', '>=', $period)
                ->avg('quantity') + $product->stock) / 2;

            return [
                'product_id' => $product->id,
                'name' => $product->name,
                'turnover_rate' => $averageInventory > 0 ? $costOfGoodsSold / $averageInventory : 0,
                'days_on_hand' => $averageInventory > 0 ? 365 / ($costOfGoodsSold / $averageInventory) : 0
            ];
        })->sortByDesc('turnover_rate')->values()->toArray();
    }

    private function analyzeVendorPerformance(Collection $vendors): array
    {
        return $vendors->map(function ($vendor) {
            $orders = $vendor->purchaseOrders;
            
            return [
                'vendor_id' => $vendor->id,
                'name' => $vendor->name,
                'metrics' => [
                    'on_time_delivery' => $this->calculateOnTimeDelivery($orders),
                    'quality_rating' => $this->calculateQualityRating($orders),
                    'price_competitiveness' => $this->calculatePriceCompetitiveness($vendor),
                    'response_time' => $this->calculateResponseTime($vendor)
                ]
            ];
        })->sortByDesc('metrics.on_time_delivery')->values()->toArray();
    }

    private function generateReorderRecommendations(Collection $products): array
    {
        return $products->filter(function ($product) {
            return $product->stock <= $product->reorder_point;
        })->map(function ($product) {
            $recommendedQuantity = max(
                $product->economic_order_quantity,
                $product->reorder_point - $product->stock
            );

            return [
                'product_id' => $product->id,
                'name' => $product->name,
                'current_stock' => $product->stock,
                'reorder_point' => $product->reorder_point,
                'recommended_quantity' => $recommendedQuantity,
                'estimated_cost' => $recommendedQuantity * $product->average_cost,
                'priority' => $product->stock <= 0 ? 'high' : 'medium'
            ];
        })->sortBy('current_stock')->values()->toArray();
    }
} 