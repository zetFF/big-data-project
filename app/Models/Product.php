<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'vendor_id',
        'category_id',
        'name',
        'slug',
        'description',
        'price',
        'stock',
        'weight',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'weight' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    // Tambahkan scope featured
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    // Relationships
    public function vendor()
    {
        return $this->belongsTo(VendorProfile::class, 'vendor_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }
} 