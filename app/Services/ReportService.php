<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportService
{
    public function getSalesReport(array $filters = [])
    {
        $query = Order::query()
            ->where('status', 'completed')
            ->when(isset($filters['start_date']), function ($q) use ($filters) {
                return $q->where('created_at', '>=', $filters['start_date']);
            })
            ->when(isset($filters['end_date']), function ($q) use ($filters) {
                return $q->where('created_at', '<=', $filters['end_date']);
            });

        $totalSales = $query->sum('total_amount');
        $orderCount = $query->count();

        $dailySales = $query->select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as orders'),
            DB::raw('SUM(total_amount) as revenue')
        )
        ->groupBy('date')
        ->get();

        $topProducts = Order::join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->select(
                'products.id',
                'products.name',
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.subtotal) as total_revenue')
            )
            ->groupBy('products.id', 'products.name')
            ->orderBy('total_revenue', 'desc')
            ->limit(10)
            ->get();

        return [
            'total_sales' => $totalSales,
            'order_count' => $orderCount,
            'daily_sales' => $dailySales,
            'top_products' => $topProducts,
            'average_order_value' => $orderCount > 0 ? $totalSales / $orderCount : 0
        ];
    }

    public function getInventoryReport()
    {
        return Product::select(
            'id',
            'name',
            'stock',
            'price',
            DB::raw('stock * price as stock_value'),
            DB::raw('(SELECT COUNT(*) FROM order_items WHERE product_id = products.id) as times_ordered')
        )
        ->orderBy('stock', 'asc')
        ->get();
    }

    public function getCustomerReport()
    {
        return DB::table('users')
            ->join('orders', 'users.id', '=', 'orders.user_id')
            ->select(
                'users.id',
                'users.name',
                'users.email',
                DB::raw('COUNT(orders.id) as total_orders'),
                DB::raw('SUM(orders.total_amount) as total_spent'),
                DB::raw('AVG(orders.total_amount) as average_order_value'),
                DB::raw('MAX(orders.created_at) as last_order_date')
            )
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderBy('total_spent', 'desc')
            ->get();
    }
} 