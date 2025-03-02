<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CartController extends Controller
{
    public function index()
    {
        $cart = auth()->user()->cart()->with('items.product')->first();
        
        return Inertia::render('Cart/Index', [
            'cart' => $cart
        ]);
    }

    public function addItem(Request $request, Product $product)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        $cart = auth()->user()->cart ?? auth()->user()->cart()->create();

        $cart->items()->updateOrCreate(
            ['product_id' => $product->id],
            ['quantity' => $request->quantity]
        );

        return back()->with('success', 'Product added to cart');
    }
} 