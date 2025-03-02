<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductCustomization extends Model
{
    protected $fillable = [
        'product_id',
        'name',
        'type', // text, select, color, file
        'options',
        'required',
        'additional_price',
        'max_length',
        'allowed_file_types'
    ];

    protected $casts = [
        'options' => 'array',
        'required' => 'boolean',
        'additional_price' => 'decimal:2',
        'allowed_file_types' => 'array'
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
} 