<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsService
{
    public function getDashboardMetrics(): array
    {
        return [
            'revenue' => $this->getRevenueMetrics(),
            'users' => $this->getUserMetrics(),
            'products' => $this->getProductMetrics(),
            'orders' => $this->getOrderMetrics(),
            'conversion' => $this->getConversionMetrics()
        ];
    }

    private function getRevenueMetrics(): array
    {
        $today = now();
        $startOfMonth = $today->copy()->startOfMonth();

        return [
            'daily' => Order::whereDate('created_at', $today)
                ->sum('total_amount'),
            'monthly' => Order::whereBetween('created_at', [$startOfMonth, $today])
                ->sum('total_amount'),
            'growth' => $this->calculateRevenueGrowth(),
            'chart_data' => $this->getRevenueChartData()
        ];
    }

    private function getUserMetrics(): array
    {
        return [
            'total' => User::count(),
            'new_today' => User::whereDate('created_at', today())->count(),
            'active_users' => $this->getActiveUsers(),
            'demographics' => $this->getUserDemographics()
        ];
    }

    private function getProductMetrics(): array
    {
        return [
            'total_products' => Product::count(),
            'out_of_stock' => Product::where('stock', 0)->count(),
            'low_stock' => Product::where('stock', '<=', DB::raw('low_stock_threshold'))->count(),
            'top_sellers' => $this->getTopSellingProducts(),
            'trending' => $this->getTrendingProducts()
        ];
    }

    private function getConversionMetrics(): array
    {
        $visits = Visit::whereDate('created_at', '>=', now()->subDays(30))->count();
        $orders = Order::whereDate('created_at', '>=', now()->subDays(30))->count();

        return [
            'rate' => $visits > 0 ? ($orders / $visits) * 100 : 0,
            'cart_abandonment' => $this->getCartAbandonmentRate(),
            'funnel' => $this->getSalesFunnel()
        ];
    }

    private function getTopSellingProducts(): array
    {
        return OrderItem::select('product_id', 
                DB::raw('SUM(quantity) as total_quantity'),
                DB::raw('SUM(subtotal) as total_revenue'))
            ->with('product:id,name,price')
            ->groupBy('product_id')
            ->orderByDesc('total_quantity')
            ->limit(10)
            ->get()
            ->toArray();
    }

    private function getSalesFunnel(): array
    {
        $period = now()->subDays(30);

        return [
            'visits' => Visit::where('created_at', '>=', $period)->count(),
            'product_views' => Visit::where('created_at', '>=', $period)
                ->where('page_type', 'product')
                ->count(),
            'add_to_cart' => Cart::where('created_at', '>=', $period)->count(),
            'checkouts' => Order::where('created_at', '>=', $period)
                ->where('status', 'pending')
                ->count(),
            'purchases' => Order::where('created_at', '>=', $period)
                ->where('status', 'completed')
                ->count()
        ];
    }

    public function getCustomerAnalytics()
    {
        return [
            'customer_retention' => $this->calculateCustomerRetention(),
            'average_order_value' => $this->calculateAverageOrderValue(),
            'customer_lifetime_value' => $this->calculateCustomerLifetimeValue(),
            'purchase_frequency' => $this->calculatePurchaseFrequency(),
        ];
    }

    private function calculateCustomerRetention()
    {
        $lastMonth = Carbon::now()->subMonth();
        $twoMonthsAgo = Carbon::now()->subMonths(2);

        $previousCustomers = Order::whereDate('created_at', '>=', $twoMonthsAgo)
            ->whereDate('created_at', '<', $lastMonth)
            ->distinct('user_id')
            ->count();

        $returnedCustomers = Order::whereDate('created_at', '>=', $lastMonth)
            ->whereHas('user', function ($query) use ($twoMonthsAgo, $lastMonth) {
                $query->whereHas('orders', function ($q) use ($twoMonthsAgo, $lastMonth) {
                    $q->whereDate('created_at', '>=', $twoMonthsAgo)
                        ->whereDate('created_at', '<', $lastMonth);
                });
            })
            ->distinct('user_id')
            ->count();

        return $previousCustomers > 0 
            ? ($returnedCustomers / $previousCustomers) * 100 
            : 0;
    }

    private function calculateAverageOrderValue()
    {
        return Order::where('status', 'completed')
            ->avg('total_amount') ?? 0;
    }

    private function calculateCustomerLifetimeValue()
    {
        return DB::table('orders')
            ->where('status', 'completed')
            ->select('user_id', DB::raw('SUM(total_amount) as total_spent'))
            ->groupBy('user_id')
            ->avg('total_spent') ?? 0;
    }
} 