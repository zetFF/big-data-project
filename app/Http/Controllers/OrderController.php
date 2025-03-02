<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with(['items', 'user'])->latest()->paginate(10);
        
        return Inertia::render('Orders/Index', [
            'orders' => $orders
        ]);
    }

    public function show(Order $order)
    {
        return Inertia::render('Orders/Show', [
            'order' => $order->load(['items.product', 'user'])
        ]);
    }

    public function store(Request $request)
    {
        // Validasi request
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1'
        ]);

        // Proses order
        $order = Order::create([
            'user_id' => auth()->id(),
            'status' => 'pending'
        ]);

        // Tambah items
        foreach ($validated['items'] as $item) {
            $order->items()->create($item);
        }

        return redirect()->route('orders.show', $order);
    }
} 