<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AffiliateMarketing extends Model
{
    protected $fillable = [
        'user_id',
        'referral_code',
        'commission_rate',
        'earnings',
        'status',
        'payout_method',
        'payout_details'
    ];

    protected $casts = [
        'commission_rate' => 'float',
        'earnings' => 'decimal:2',
        'payout_details' => 'json'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function referrals(): HasMany
    {
        return $this->hasMany(AffiliateReferral::class);
    }

    public function commissions(): HasMany
    {
        return $this->hasMany(AffiliateCommission::class);
    }

    public function payouts(): HasMany
    {
        return $this->hasMany(AffiliatePayout::class);
    }

    public function calculateCommission(float $orderAmount): float
    {
        return $orderAmount * ($this->commission_rate / 100);
    }
} 