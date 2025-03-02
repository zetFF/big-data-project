<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApiController extends Controller
{
    public function products(Request $request)
    {
        $products = Product::query()
            ->when($request->search, function ($query, $search) {
                return $query->where('name', 'like', "%{$search}%");
            })
            ->when($request->category_id, function ($query, $categoryId) {
                return $query->where('category_id', $categoryId);
            })
            ->with(['category', 'images'])
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'status' => 'success',
            'data' => $products
        ]);
    }

    public function createOrder(Request $request)
    {
        $validatedData = $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'shipping_address' => 'required|string',
            'payment_method' => 'required|string'
        ]);

        $order = Order::create([
            'user_id' => Auth::id(),
            'status' => 'pending',
            'shipping_address' => $validatedData['shipping_address'],
            'payment_method' => $validatedData['payment_method']
        ]);

        foreach ($validatedData['items'] as $item) {
            $product = Product::find($item['product_id']);
            $order->items()->create([
                'product_id' => $product->id,
                'quantity' => $item['quantity'],
                'price' => $product->price,
                'subtotal' => $product->price * $item['quantity']
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Order created successfully',
            'data' => $order->load('items.product')
        ]);
    }

    public function orderStatus(Order $order)
    {
        $this->authorize('view', $order);

        return response()->json([
            'status' => 'success',
            'data' => [
                'order_id' => $order->id,
                'status' => $order->status,
                'tracking_number' => $order->tracking_number,
                'estimated_delivery' => $order->estimated_delivery_date
            ]
        ]);
    }
} 