<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;

class AdminDashboardController extends Controller
{
    public function index()
    {
        $statistics = [
            'total_orders' => Order::count(),
            'total_revenue' => Order::sum('total_amount'),
            'total_products' => Product::count(),
            'total_customers' => User::where('role', 'customer')->count(),
        ];

        $recentOrders = Order::with(['user'])
            ->latest()
            ->take(5)
            ->get();

        $topProducts = Product::withCount('orders')
            ->orderBy('orders_count', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'statistics' => $statistics,
            'recentOrders' => $recentOrders,
            'topProducts' => $topProducts
        ]);
    }
} 