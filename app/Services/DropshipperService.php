<?php

namespace App\Services;

use App\Models\Order;
use App\Models\DropshipperProfile;
use Illuminate\Support\Facades\DB;

class DropshipperService
{
    public function createOrder(DropshipperProfile $dropshipper, array $data): Order
    {
        return DB::transaction(function () use ($dropshipper, $data) {
            $order = Order::create([
                'user_id' => $dropshipper->user_id,
                'customer_name' => $data['customer_name'],
                'customer_email' => $data['customer_email'],
                'customer_phone' => $data['customer_phone'],
                'shipping_address' => $data['shipping_address'],
                'status' => 'pending',
                'is_dropshipping' => true,
                'dropshipper_id' => $dropshipper->id
            ]);

            $total = 0;
            foreach ($data['products'] as $item) {
                $product = Product::find($item['id']);
                $price = $dropshipper->calculatePrice($product->price);
                
                $order->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price' => $price,
                    'subtotal' => $price * $item['quantity']
                ]);

                $total += $price * $item['quantity'];
            }

            $order->update(['total_amount' => $total]);

            return $order;
        });
    }

    public function getStatistics(DropshipperProfile $dropshipper): array
    {
        $orders = Order::where('dropshipper_id', $dropshipper->id);

        return [
            'total_orders' => $orders->count(),
            'total_revenue' => $orders->sum('total_amount'),
            'pending_orders' => $orders->where('status', 'pending')->count(),
            'completed_orders' => $orders->where('status', 'completed')->count(),
            'monthly_revenue' => $orders->whereMonth('created_at', now()->month)
                                      ->sum('total_amount')
        ];
    }

    public function getRecentOrders(DropshipperProfile $dropshipper)
    {
        return Order::where('dropshipper_id', $dropshipper->id)
            ->with(['items.product'])
            ->latest()
            ->take(10)
            ->get();
    }
} 