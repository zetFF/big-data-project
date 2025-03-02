<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoyaltyPoint extends Model
{
    protected $fillable = [
        'user_id',
        'points',
        'type',
        'description',
        'expires_at',
        'reference_id',
        'reference_type'
    ];

    protected $casts = [
        'points' => 'integer',
        'expires_at' => 'datetime'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reference()
    {
        return $this->morphTo();
    }

    public static function awardPoints(User $user, int $points, string $type, string $description, $reference = null)
    {
        return self::create([
            'user_id' => $user->id,
            'points' => $points,
            'type' => $type,
            'description' => $description,
            'reference_id' => $reference?->id,
            'reference_type' => $reference ? get_class($reference) : null,
            'expires_at' => now()->addYear()
        ]);
    }
} 