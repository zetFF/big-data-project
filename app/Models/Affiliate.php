<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Affiliate extends Model
{
    protected $fillable = [
        'user_id',
        'referral_code',
        'commission_rate',
        'total_earnings',
        'payment_info',
        'status'
    ];

    protected $casts = [
        'payment_info' => 'json',
        'commission_rate' => 'float',
        'total_earnings' => 'decimal:2'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function referrals()
    {
        return $this->hasMany(User::class, 'referred_by');
    }

    public function commissions()
    {
        return $this->hasMany(AffiliateCommission::class);
    }
} 