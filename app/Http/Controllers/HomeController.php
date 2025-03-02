<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        $featuredProducts = Product::featured()->take(8)->get();
        $newArrivals = Product::latest()->take(8)->get();
        
        return Inertia::render('Home', [
            'featuredProducts' => $featuredProducts,
            'newArrivals' => $newArrivals
        ]);
    }
} 