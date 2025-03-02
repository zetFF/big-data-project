<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Services\DropshipperService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DropshipperController extends Controller
{
    protected $dropshipperService;

    public function __construct(DropshipperService $dropshipperService)
    {
        $this->dropshipperService = $dropshipperService;
    }

    public function dashboard()
    {
        $dropshipper = auth()->user()->dropshipperProfile;
        $statistics = $this->dropshipperService->getStatistics($dropshipper);
        $recentOrders = $this->dropshipperService->getRecentOrders($dropshipper);

        return Inertia::render('Dropshipper/Dashboard', [
            'profile' => $dropshipper,
            'statistics' => $statistics,
            'recentOrders' => $recentOrders
        ]);
    }

    public function createOrder(Request $request)
    {
        $validatedData = $request->validate([
            'customer_name' => 'required|string',
            'customer_email' => 'required|email',
            'customer_phone' => 'required|string',
            'shipping_address' => 'required|string',
            'products' => 'required|array',
            'products.*.id' => 'required|exists:products,id',
            'products.*.quantity' => 'required|integer|min:1'
        ]);

        $order = $this->dropshipperService->createOrder(
            auth()->user()->dropshipperProfile,
            $validatedData
        );

        return response()->json([
            'message' => 'Order created successfully',
            'order' => $order
        ]);
    }

    public function products()
    {
        $products = Product::where('dropshipping_enabled', true)
            ->with('images')
            ->paginate(20);

        return Inertia::render('Dropshipper/Products', [
            'products' => $products
        ]);
    }

    public function updateProfile(Request $request)
    {
        $validatedData = $request->validate([
            'company_name' => 'required|string',
            'address' => 'required|string',
            'phone' => 'required|string',
            'markup_percentage' => 'required|numeric|min:0|max:100',
            'bank_name' => 'required|string',
            'bank_account' => 'required|string',
            'bank_holder_name' => 'required|string'
        ]);

        auth()->user()->dropshipperProfile()->update($validatedData);

        return back()->with('success', 'Profile updated successfully');
    }
} 