<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WishlistController extends Controller
{
    public function index()
    {
        $wishlist = auth()->user()->wishlist()
            ->with(['product.images', 'product.category'])
            ->latest()
            ->get();

        return Inertia::render('Wishlist/Index', [
            'wishlist' => $wishlist
        ]);
    }

    public function toggle(Product $product)
    {
        $wishlist = auth()->user()->wishlist();

        if ($wishlist->where('product_id', $product->id)->exists()) {
            $wishlist->where('product_id', $product->id)->delete();
            $message = 'Product removed from wishlist';
            $added = false;
        } else {
            $wishlist->create(['product_id' => $product->id]);
            $message = 'Product added to wishlist';
            $added = true;
        }

        return response()->json([
            'message' => $message,
            'added' => $added
        ]);
    }
} 