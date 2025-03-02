<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ComparisonController extends Controller
{
    public function index()
    {
        $products = auth()->user()->comparisonList()
            ->with(['product.category', 'product.specifications', 'product.reviews'])
            ->get()
            ->pluck('product');

        return Inertia::render('Products/Compare', [
            'products' => $products,
            'specifications' => $this->getSpecificationsList($products),
        ]);
    }

    public function toggle(Product $product)
    {
        $comparison = auth()->user()->comparisonList();
        
        if ($comparison->count() >= 4 && !$comparison->where('product_id', $product->id)->exists()) {
            return response()->json([
                'message' => 'Maximum 4 products can be compared',
            ], 422);
        }

        if ($comparison->where('product_id', $product->id)->exists()) {
            $comparison->where('product_id', $product->id)->delete();
            $message = 'Product removed from comparison';
            $added = false;
        } else {
            $comparison->create(['product_id' => $product->id]);
            $message = 'Product added to comparison';
            $added = true;
        }

        return response()->json([
            'message' => $message,
            'added' => $added
        ]);
    }

    private function getSpecificationsList($products)
    {
        return $products->flatMap(function ($product) {
            return $product->specifications->pluck('name');
        })->unique()->values();
    }
} 