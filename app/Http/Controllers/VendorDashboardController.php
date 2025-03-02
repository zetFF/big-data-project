<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\Product;

class VendorDashboardController extends Controller
{
    public function index()
    {
        $vendor = auth()->user();
        
        $statistics = [
            'total_products' => Product::where('vendor_id', $vendor->id)->count(),
            'total_orders' => Order::whereHas('items.product', function($query) use ($vendor) {
                $query->where('vendor_id', $vendor->id);
            })->count(),
            'total_revenue' => Order::whereHas('items.product', function($query) use ($vendor) {
                $query->where('vendor_id', $vendor->id);
            })->sum('total_amount'),
        ];

        return Inertia::render('Vendor/Dashboard', [
            'statistics' => $statistics
        ]);
    }
} 