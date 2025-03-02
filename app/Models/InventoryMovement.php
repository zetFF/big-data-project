<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryMovement extends Model
{
    protected $fillable = [
        'product_id',
        'quantity',
        'type',
        'reason',
        'previous_stock',
        'reference_id',
        'reference_type'
    ];

    protected $casts = [
        'quantity' => 'integer',
        'previous_stock' => 'integer'
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function reference()
    {
        return $this->morphTo();
    }
} 