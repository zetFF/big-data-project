<?php

namespace App\Http\Controllers;

use App\Models\ProductBundle;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductBundleController extends Controller
{
    public function index()
    {
        $bundles = ProductBundle::with(['items.product.images'])
            ->where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>', now())
            ->latest()
            ->paginate(12);

        return Inertia::render('Bundles/Index', [
            'bundles' => $bundles
        ]);
    }

    public function show(ProductBundle $bundle)
    {
        $bundle->load(['items.product.images', 'items.product.reviews']);

        return Inertia::render('Bundles/Show', [
            'bundle' => $bundle,
            'similarBundles' => ProductBundle::where('id', '!=', $bundle->id)
                ->where('status', 'active')
                ->where('start_date', '<=', now())
                ->where('end_date', '>', now())
                ->limit(4)
                ->get()
        ]);
    }

    public function addToCart(ProductBundle $bundle)
    {
        if (!$bundle->isActive()) {
            return back()->with('error', 'This bundle is no longer available');
        }

        // Check stock availability for all items
        foreach ($bundle->items as $item) {
            if ($item->product->stock < $item->quantity) {
                return back()->with('error', 'Some items in this bundle are out of stock');
            }
        }

        // Add bundle items to cart
        $cart = auth()->user()->cart();
        
        foreach ($bundle->items as $item) {
            $cart->items()->create([
                'product_id' => $item->product_id,
                'quantity' => $item->quantity,
                'price' => $item->product->price,
                'bundle_id' => $bundle->id
            ]);
        }

        return redirect()->route('cart.index')
            ->with('success', 'Bundle added to cart successfully');
    }
} 