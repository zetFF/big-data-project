<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Review extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'product_id',
        'rating',
        'title',
        'comment',
        'pros',
        'cons',
        'verified_purchase',
        'helpful_count'
    ];

    protected $casts = [
        'pros' => 'array',
        'cons' => 'array',
        'verified_purchase' => 'boolean',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ReviewImage::class);
    }

    public function responses(): HasMany
    {
        return $this->hasMany(ReviewResponse::class);
    }

    public function markAsHelpful(User $user)
    {
        if (!$this->helpfulVotes()->where('user_id', $user->id)->exists()) {
            $this->helpfulVotes()->create(['user_id' => $user->id]);
            $this->increment('helpful_count');
        }
    }
} 