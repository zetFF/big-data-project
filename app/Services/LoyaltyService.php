<?php

namespace App\Services;

use App\Models\User;
use App\Models\Order;
use App\Models\LoyaltyPoint;
use Carbon\Carbon;

class LoyaltyService
{
    const POINTS_PER_DOLLAR = 1;
    const POINTS_FOR_REVIEW = 50;
    const POINTS_FOR_VIDEO_REVIEW = 100;
    const POINTS_FOR_REFERRAL = 200;

    public function getCurrentPoints(User $user): int
    {
        return $user->loyaltyPoints()
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', Carbon::now());
            })
            ->sum('points');
    }

    public function awardPointsForOrder(Order $order)
    {
        $points = (int) ($order->total_amount * self::POINTS_PER_DOLLAR);

        return LoyaltyPoint::awardPoints(
            $order->user,
            $points,
            'purchase',
            "Points earned from order #{$order->order_number}",
            $order
        );
    }

    public function awardPointsForReview($review)
    {
        $points = $review instanceof VideoReview 
            ? self::POINTS_FOR_VIDEO_REVIEW 
            : self::POINTS_FOR_REVIEW;

        return LoyaltyPoint::awardPoints(
            $review->user,
            $points,
            'review',
            'Points earned for product review',
            $review
        );
    }

    public function redeemPoints(User $user, int $points, string $description)
    {
        if ($this->getCurrentPoints($user) < $points) {
            throw new \Exception('Insufficient points');
        }

        return LoyaltyPoint::awardPoints(
            $user,
            -$points,
            'redemption',
            $description
        );
    }

    public function getPointsHistory(User $user)
    {
        return $user->loyaltyPoints()
            ->with('reference')
            ->latest()
            ->paginate(15);
    }

    public function getExpiringPoints(User $user)
    {
        return $user->loyaltyPoints()
            ->where('points', '>', 0)
            ->where('expires_at', '<=', Carbon::now()->addMonth())
            ->where('expires_at', '>', Carbon::now())
            ->sum('points');
    }
} 