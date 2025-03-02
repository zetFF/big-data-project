<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductBundle extends Model
{
    protected $fillable = [
        'name',
        'description',
        'discount_percentage',
        'start_date',
        'end_date',
        'status',
        'slug',
        'featured_image'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'discount_percentage' => 'float'
    ];

    public function items(): HasMany
    {
        return $this->hasMany(ProductBundleItem::class);
    }

    public function getOriginalPriceAttribute()
    {
        return $this->items->sum(function ($item) {
            return $item->product->price * $item->quantity;
        });
    }

    public function getDiscountedPriceAttribute()
    {
        $originalPrice = $this->original_price;
        return $originalPrice - ($originalPrice * ($this->discount_percentage / 100));
    }

    public function isActive(): bool
    {
        return $this->status === 'active' 
            && $this->start_date <= now() 
            && $this->end_date > now();
    }
} 