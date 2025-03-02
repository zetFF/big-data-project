<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FlashSale extends Model
{
    protected $fillable = [
        'name',
        'description',
        'start_time',
        'end_time',
        'status'
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime'
    ];

    public function items(): HasMany
    {
        return $this->hasMany(FlashSaleItem::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active' 
            && $this->start_time <= now() 
            && $this->end_time > now();
    }

    public function hasStarted(): bool
    {
        return $this->start_time <= now();
    }

    public function hasEnded(): bool
    {
        return $this->end_time <= now();
    }

    public function getTimeRemainingAttribute()
    {
        if (!$this->hasStarted()) {
            return $this->start_time->diffForHumans();
        }
        
        if (!$this->hasEnded()) {
            return $this->end_time->diffForHumans();
        }

        return 'Ended';
    }
} 