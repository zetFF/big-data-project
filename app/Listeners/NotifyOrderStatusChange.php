<?php

namespace App\Listeners;

use App\Events\OrderStatusChanged;
use App\Notifications\OrderStatusUpdate;
use Illuminate\Contracts\Queue\ShouldQueue;

class NotifyOrderStatusChange implements ShouldQueue
{
    public function handle(OrderStatusChanged $event): void
    {
        $event->order->user->notify(new OrderStatusUpdate($event->order));
    }
} 