<?php

namespace App\Http\Controllers;

use App\Models\FlashSale;
use App\Models\FlashSaleItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Models\Order;

class FlashSaleController extends Controller
{
    public function index()
    {
        $activeFlashSale = FlashSale::where('status', 'active')
            ->where('start_time', '<=', now())
            ->where('end_time', '>', now())
            ->with(['items.product.images'])
            ->first();

        $upcomingFlashSales = FlashSale::where('status', 'active')
            ->where('start_time', '>', now())
            ->orderBy('start_time')
            ->limit(3)
            ->get();

        return Inertia::render('FlashSale/Index', [
            'activeFlashSale' => $activeFlashSale,
            'upcomingFlashSales' => $upcomingFlashSales,
        ]);
    }

    public function show(FlashSale $flashSale)
    {
        $flashSale->load(['items.product.images']);

        return Inertia::render('FlashSale/Show', [
            'flashSale' => $flashSale
        ]);
    }

    public function purchase(FlashSaleItem $item)
    {
        $this->authorize('purchase-flash-sale', $item);

        if (!$item->hasAvailableStock()) {
            return back()->with('error', 'Item is out of stock');
        }

        // Process the purchase
        DB::transaction(function () use ($item) {
            $item->decrement('stock');
            
            // Create order
            $order = Order::create([
                'user_id' => auth()->id(),
                'total_amount' => $item->flash_sale_price,
                'status' => 'pending'
            ]);

            // Create order item
            $order->items()->create([
                'product_id' => $item->product_id,
                'quantity' => 1,
                'price' => $item->flash_sale_price,
                'subtotal' => $item->flash_sale_price
            ]);
        });

        return redirect()->route('orders.show', $order)
            ->with('success', 'Flash sale item purchased successfully!');
    }
} 