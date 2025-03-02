<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PreOrder extends Model
{
    protected $fillable = [
        'user_id',
        'product_id',
        'quantity',
        'status',
        'expected_date',
        'deposit_amount',
        'total_amount',
        'payment_status'
    ];

    protected $casts = [
        'expected_date' => 'datetime',
        'deposit_amount' => 'decimal:2',
        'total_amount' => 'decimal:2'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function getRemainingAmountAttribute(): float
    {
        return $this->total_amount - $this->deposit_amount;
    }
} 