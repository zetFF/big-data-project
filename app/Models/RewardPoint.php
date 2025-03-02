<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RewardPoint extends Model
{
    protected $fillable = [
        'user_id',
        'points',
        'type',
        'description',
        'expires_at',
        'order_id'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public static function awardPointsForOrder(Order $order)
    {
        return self::create([
            'user_id' => $order->user_id,
            'points' => floor($order->total_amount * config('rewards.points_per_dollar', 1)),
            'type' => 'earned',
            'description' => "Points earned from order #{$order->order_number}",
            'order_id' => $order->id,
            'expires_at' => now()->addMonths(config('rewards.expiry_months', 12)),
        ]);
    }
} 