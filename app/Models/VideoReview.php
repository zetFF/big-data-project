<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VideoReview extends Model
{
    protected $fillable = [
        'user_id',
        'product_id',
        'title',
        'description',
        'video_url',
        'thumbnail_url',
        'status',
        'likes_count',
        'views_count',
        'duration'
    ];

    protected $casts = [
        'duration' => 'integer',
        'likes_count' => 'integer',
        'views_count' => 'integer'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function incrementViews(): void
    {
        $this->increment('views_count');
    }

    public function toggleLike(User $user): bool
    {
        $liked = $this->likes()->toggle($user->id);
        $this->likes_count = $this->likes()->count();
        $this->save();
        
        return count($liked['attached']) > 0;
    }
} 