<?php

namespace App\Services;

use App\Models\PriceAlert;
use App\Models\Product;
use App\Models\User;
use App\Notifications\PriceAlertNotification;
use Carbon\Carbon;

class PriceAlertService
{
    public function createAlert(User $user, Product $product, float $targetPrice): PriceAlert
    {
        return PriceAlert::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'target_price' => $targetPrice,
            'status' => 'active',
            'notification_sent' => false,
            'expires_at' => Carbon::now()->addMonths(3)
        ]);
    }

    public function checkAlerts(): void
    {
        PriceAlert::with(['user', 'product'])
            ->where('status', 'active')
            ->where('notification_sent', false)
            ->whereNull('expires_at')
            ->orWhere('expires_at', '>', Carbon::now())
            ->chunk(100, function ($alerts) {
                foreach ($alerts as $alert) {
                    if ($alert->shouldNotify()) {
                        $alert->user->notify(new PriceAlertNotification($alert));
                        $alert->update([
                            'notification_sent' => true,
                            'status' => 'completed'
                        ]);
                    }
                }
            });
    }

    public function getUserAlerts(User $user)
    {
        return PriceAlert::where('user_id', $user->id)
            ->with('product')
            ->latest()
            ->paginate(10);
    }
} 