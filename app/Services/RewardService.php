<?php

namespace App\Services;

use App\Models\User;
use App\Models\Order;
use App\Models\RewardPoint;
use Carbon\Carbon;

class RewardService
{
    public function getCurrentPoints(User $user): int
    {
        return $user->rewardPoints()
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', Carbon::now());
            })
            ->sum('points');
    }

    public function getPointsHistory(User $user)
    {
        return $user->rewardPoints()
            ->with('order')
            ->latest()
            ->paginate(15);
    }

    public function canRedeemPoints(User $user, int $points): bool
    {
        return $this->getCurrentPoints($user) >= $points;
    }

    public function redeemPoints(User $user, int $points, Order $order)
    {
        if (!$this->canRedeemPoints($user, $points)) {
            throw new \Exception('Insufficient points');
        }

        return RewardPoint::create([
            'user_id' => $user->id,
            'points' => -$points,
            'type' => 'redeemed',
            'description' => "Points redeemed for order #{$order->order_number}",
            'order_id' => $order->id,
        ]);
    }

    public function getExpiringPoints(User $user)
    {
        return $user->rewardPoints()
            ->where('expires_at', '>', Carbon::now())
            ->where('expires_at', '<=', Carbon::now()->addMonth())
            ->where('points', '>', 0)
            ->sum('points');
    }
} 