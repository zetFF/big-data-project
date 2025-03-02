<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function view(User $user, Order $order): bool
    {
        return $user->id === $order->user_id || 
               ($user->role === 'vendor' && $order->items()->whereHas('product', function ($query) use ($user) {
                   $query->where('vendor_id', $user->vendorProfile->id);
               })->exists());
    }

    public function create(User $user): bool
    {
        return $user->role === 'customer';
    }

    public function update(User $user, Order $order): bool
    {
        return $user->role === 'admin' || 
               ($user->role === 'vendor' && $order->items()->whereHas('product', function ($query) use ($user) {
                   $query->where('vendor_id', $user->vendorProfile->id);
               })->exists());
    }
} 