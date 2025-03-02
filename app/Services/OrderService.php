<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Cart;
use Illuminate\Support\Str;

class OrderService
{
    public function createFromCart(Cart $cart, array $shippingData): Order
    {
        $order = \DB::transaction(function () use ($cart, $shippingData) {
            $total = $cart->items->sum(function ($item) {
                return $item->product->price * $item->quantity;
            });

            $order = Order::create([
                'order_number' => 'ORD-' . Str::random(10),
                'user_id' => $cart->user_id,
                'total_amount' => $total + ($shippingData['shipping_cost'] ?? 0),
                'shipping_address' => $shippingData['shipping_address'],
                'shipping_city' => $shippingData['shipping_city'],
                'shipping_postal_code' => $shippingData['shipping_postal_code'],
                'shipping_phone' => $shippingData['shipping_phone'],
                'shipping_cost' => $shippingData['shipping_cost'] ?? 0,
                'payment_method' => $shippingData['payment_method'],
            ]);

            foreach ($cart->items as $item) {
                $order->items()->create([
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => $item->product->price,
                    'subtotal' => $item->product->price * $item->quantity,
                ]);

                // Decrease product stock
                $item->product->decrement('stock', $item->quantity);
            }

            // Clear the cart
            $cart->items()->delete();
            $cart->delete();

            return $order;
        });

        return $order;
    }
} 