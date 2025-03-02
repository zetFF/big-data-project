<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BulkOrder extends Model
{
    protected $fillable = [
        'user_id',
        'status',
        'total_amount',
        'discount_percentage',
        'discount_amount',
        'final_amount',
        'payment_status',
        'expected_delivery_date',
        'notes'
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'discount_percentage' => 'float',
        'discount_amount' => 'decimal:2',
        'final_amount' => 'decimal:2',
        'expected_delivery_date' => 'datetime'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(BulkOrderItem::class);
    }

    public function calculateDiscount(): void
    {
        $this->discount_amount = $this->total_amount * ($this->discount_percentage / 100);
        $this->final_amount = $this->total_amount - $this->discount_amount;
    }
} 