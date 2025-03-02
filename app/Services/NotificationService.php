<?php

namespace App\Services;

use App\Models\User;
use App\Models\Notification;
use App\Events\NewNotification;
use Illuminate\Support\Facades\Cache;

class NotificationService
{
    public function send(User $user, string $type, array $data)
    {
        $notification = Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'data' => $data,
            'read_at' => null
        ]);

        broadcast(new NewNotification($notification))->toOthers();

        // Clear user's notification cache
        Cache::forget("user.{$user->id}.notifications");

        return $notification;
    }

    public function markAsRead(Notification $notification)
    {
        $notification->update(['read_at' => now()]);
        Cache::forget("user.{$notification->user_id}.notifications");
    }

    public function markAllAsRead(User $user)
    {
        $user->notifications()
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        Cache::forget("user.{$user->id}.notifications");
    }

    public function getUnreadCount(User $user): int
    {
        return Cache::remember("user.{$user->id}.unread_notifications", 300, function () use ($user) {
            return $user->notifications()
                ->whereNull('read_at')
                ->count();
        });
    }

    public function sendFlashSaleNotification(User $user, FlashSale $flashSale)
    {
        return $this->send($user, 'flash_sale', [
            'title' => 'New Flash Sale Starting Soon!',
            'message' => "Don't miss out on {$flashSale->name}",
            'flash_sale_id' => $flashSale->id,
            'start_time' => $flashSale->start_time->format('Y-m-d H:i:s')
        ]);
    }

    public function sendOrderStatusNotification(Order $order)
    {
        return $this->send($order->user, 'order_status', [
            'title' => 'Order Status Updated',
            'message' => "Your order #{$order->order_number} is now {$order->status}",
            'order_id' => $order->id
        ]);
    }
} 