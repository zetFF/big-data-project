<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Services\SearchService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;
use App\Models\Category;
use App\Models\VendorProfile;
use App\Models\ProductCustomization;

class ProductController extends Controller
{
    public function __construct(
        protected SearchService $searchService
    ) {}

    public function index(Request $request)
    {
        $filters = $request->only([
            'search',
            'category',
            'vendor',
            'price_min',
            'price_max',
            'sort',
            'per_page',
        ]);

        return Inertia::render('Products/Index', [
            'products' => $this->searchService->searchProducts($filters),
            'filters' => $filters,
            'categories' => Cache::remember('categories', now()->addDay(), function () {
                return Category::select('id', 'name')->get();
            }),
            'vendors' => Cache::remember('active_vendors', now()->addHour(), function () {
                return VendorProfile::where('status', 'approved')
                    ->select('id', 'shop_name')
                    ->get();
            }),
        ]);
    }

    public function show(Product $product)
    {
        $product->load(['category', 'images', 'reviews.user']);
        
        return Inertia::render('Products/Show', [
            'product' => $product
        ]);
    }

    public function customize(Request $request, Product $product)
    {
        $validatedData = $request->validate([
            'customizations' => 'required|array',
            'customizations.*.id' => 'required|exists:product_customizations,id',
            'customizations.*.value' => 'required',
            'quantity' => 'required|integer|min:1'
        ]);

        $totalPrice = $product->price;
        $customizationDetails = [];

        foreach ($validatedData['customizations'] as $customization) {
            $option = ProductCustomization::find($customization['id']);
            $totalPrice += $option->additional_price;
            
            $customizationDetails[] = [
                'name' => $option->name,
                'value' => $customization['value'],
                'additional_price' => $option->additional_price
            ];
        }

        $cartItem = auth()->user()->cart()->create([
            'product_id' => $product->id,
            'quantity' => $validatedData['quantity'],
            'price' => $totalPrice,
            'customization_details' => $customizationDetails
        ]);

        return response()->json([
            'message' => 'Product added to cart with customizations',
            'cart_item' => $cartItem
        ]);
    }
} 