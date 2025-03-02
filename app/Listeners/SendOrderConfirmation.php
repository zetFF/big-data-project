<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use App\Notifications\OrderConfirmation;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendOrderConfirmation implements ShouldQueue
{
    public function handle(OrderCreated $event): void
    {
        $event->order->user->notify(new OrderConfirmation($event->order));
        
        // Notify vendor(s)
        $vendors = $event->order->items->pluck('product.vendor')->unique();
        foreach ($vendors as $vendor) {
            $vendor->user->notify(new NewOrderNotification($event->order));
        }
    }
} 