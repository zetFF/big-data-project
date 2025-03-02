<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DropshipperProfile extends Model
{
    protected $fillable = [
        'user_id',
        'company_name',
        'address',
        'phone',
        'markup_percentage',
        'status',
        'bank_account',
        'bank_name',
        'bank_holder_name'
    ];

    protected $casts = [
        'markup_percentage' => 'float',
        'bank_account' => 'encrypted'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function calculatePrice(float $originalPrice): float
    {
        return $originalPrice * (1 + ($this->markup_percentage / 100));
    }
} 