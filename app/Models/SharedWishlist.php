<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class SharedWishlist extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'description',
        'share_code',
        'expires_at',
        'visibility'
    ];

    protected $casts = [
        'expires_at' => 'datetime'
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($sharedWishlist) {
            $sharedWishlist->share_code = Str::random(10);
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(SharedWishlistItem::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function isPublic(): bool
    {
        return $this->visibility === 'public';
    }
} 