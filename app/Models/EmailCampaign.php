<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmailCampaign extends Model
{
    protected $fillable = [
        'name',
        'subject',
        'content',
        'target_segment',
        'scheduled_at',
        'status',
        'sent_count',
        'open_count',
        'click_count'
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'sent_count' => 'integer',
        'open_count' => 'integer',
        'click_count' => 'integer'
    ];

    public function engagements(): HasMany
    {
        return $this->hasMany(EmailEngagement::class);
    }

    public function getOpenRate(): float
    {
        return $this->sent_count > 0 
            ? ($this->open_count / $this->sent_count) * 100 
            : 0;
    }

    public function getClickRate(): float
    {
        return $this->sent_count > 0 
            ? ($this->click_count / $this->sent_count) * 100 
            : 0;
    }
} 