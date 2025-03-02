<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $statistics = [
            'total_sales' => Order::where('status', 'completed')
                ->sum('total_amount'),
            'total_orders' => Order::count(),
            'total_customers' => User::where('role', 'customer')->count(),
            'total_products' => Product::count(),
        ];

        $recentOrders = Order::with(['user', 'items.product'])
            ->latest()
            ->take(5)
            ->get();

        $salesChart = Order::where('status', 'completed')
            ->whereBetween('created_at', [now()->subDays(30), now()])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_amount) as total')
            )
            ->groupBy('date')
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'statistics' => $statistics,
            'recentOrders' => $recentOrders,
            'salesChart' => $salesChart,
        ]);
    }
} 