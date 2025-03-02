<?php

namespace App\Services;

use App\Models\Order;
use Midtrans\Config;
use Midtrans\Snap;

class PaymentService
{
    public function __construct()
    {
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production');
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }

    public function createPaymentSession(Order $order)
    {
        $params = [
            'transaction_details' => [
                'order_id' => $order->order_number,
                'gross_amount' => (int) $order->total_amount,
            ],
            'customer_details' => [
                'first_name' => $order->user->name,
                'email' => $order->user->email,
                'phone' => $order->shipping_phone,
            ],
            'item_details' => $this->getItemDetails($order),
        ];

        try {
            $snapToken = Snap::getSnapToken($params);
            return [
                'success' => true,
                'token' => $snapToken,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    private function getItemDetails(Order $order)
    {
        $items = $order->items->map(function ($item) {
            return [
                'id' => $item->product_id,
                'price' => (int) $item->price,
                'quantity' => $item->quantity,
                'name' => $item->product->name,
            ];
        })->toArray();

        // Add shipping cost as an item
        $items[] = [
            'id' => 'SHIPPING',
            'price' => (int) $order->shipping_cost,
            'quantity' => 1,
            'name' => 'Shipping Cost',
        ];

        return $items;
    }
} 