<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PriceAlert extends Model
{
    protected $fillable = [
        'user_id',
        'product_id',
        'target_price',
        'status',
        'notification_sent',
        'expires_at'
    ];

    protected $casts = [
        'target_price' => 'decimal:2',
        'notification_sent' => 'boolean',
        'expires_at' => 'datetime'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function shouldNotify(): bool
    {
        return !$this->notification_sent 
            && $this->product->price <= $this->target_price 
            && (!$this->expires_at || $this->expires_at->isFuture());
    }
} 