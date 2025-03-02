<?php

namespace App\Services;

use App\Models\User;
use App\Models\Order;
use App\Models\LoyaltyPoint;
use App\Models\LoyaltyReward;
use App\Models\LoyaltyTier;
use App\Notifications\LoyaltyPointsEarned;
use App\Notifications\LoyaltyTierUpgrade;

class LoyaltyProgramService
{
    public function calculatePoints(Order $order): int
    {
        $basePoints = floor($order->total_amount);
        $multiplier = $this->getPointsMultiplier($order->user);
        
        // Calculate bonus points
        $bonusPoints = $this->calculateBonusPoints($order);
        
        return ceil($basePoints * $multiplier) + $bonusPoints;
    }

    public function awardPoints(Order $order): void
    {
        $points = $this->calculatePoints($order);
        
        LoyaltyPoint::create([
            'user_id' => $order->user_id,
            'order_id' => $order->id,
            'points' => $points,
            'type' => 'earned',
            'description' => "Points earned from order #{$order->id}",
            'expires_at' => now()->addMonths(12)
        ]);

        $order->user->notify(new LoyaltyPointsEarned($points, $order));
        
        $this->checkAndUpdateTier($order->user);
    }

    public function redeemPoints(User $user, LoyaltyReward $reward): bool
    {
        if ($user->loyalty_points_balance < $reward->points_required) {
            throw new \Exception('Insufficient points balance');
        }

        LoyaltyPoint::create([
            'user_id' => $user->id,
            'points' => -$reward->points_required,
            'type' => 'redeemed',
            'description' => "Redeemed for {$reward->name}",
            'reward_id' => $reward->id
        ]);

        $reward->redeem($user);
        return true;
    }

    public function getAvailableRewards(User $user): Collection
    {
        return LoyaltyReward::where('points_required', '<=', $user->loyalty_points_balance)
            ->where('is_active', true)
            ->get()
            ->map(function ($reward) use ($user) {
                return array_merge($reward->toArray(), [
                    'can_redeem' => $this->canRedeemReward($user, $reward)
                ]);
            });
    }

    public function checkAndUpdateTier(User $user): void
    {
        $currentTier = $user->loyaltyTier;
        $qualifyingPoints = $this->calculateQualifyingPoints($user);
        
        $newTier = LoyaltyTier::where('qualifying_points', '<=', $qualifyingPoints)
            ->orderByDesc('qualifying_points')
            ->first();

        if ($newTier && $newTier->id !== $currentTier->id) {
            $user->update(['loyalty_tier_id' => $newTier->id]);
            $user->notify(new LoyaltyTierUpgrade($newTier));
        }
    }

    private function getPointsMultiplier(User $user): float
    {
        return $user->loyaltyTier->points_multiplier;
    }

    private function calculateBonusPoints(Order $order): int
    {
        $bonusPoints = 0;

        // Birthday bonus
        if ($order->user->birthday && $order->user->birthday->isToday()) {
            $bonusPoints += floor($order->total_amount * 0.5); // 50% bonus
        }

        // Special promotion bonus
        foreach ($order->items as $item) {
            if ($item->product->bonus_points_multiplier) {
                $bonusPoints += floor($item->subtotal * ($item->product->bonus_points_multiplier - 1));
            }
        }

        // First purchase bonus
        if ($order->user->orders()->count() === 1) {
            $bonusPoints += 1000;
        }

        return $bonusPoints;
    }

    private function calculateQualifyingPoints(User $user): int
    {
        return LoyaltyPoint::where('user_id', $user->id)
            ->where('created_at', '>=', now()->subMonths(12))
            ->sum('points');
    }

    private function canRedeemReward(User $user, LoyaltyReward $reward): bool
    {
        if ($reward->tier_restricted && $user->loyaltyTier->level < $reward->minimum_tier) {
            return false;
        }

        if ($reward->limited_quantity && $reward->remaining_quantity <= 0) {
            return false;
        }

        return true;
    }

    public function getPointsHistory(User $user): Collection
    {
        return LoyaltyPoint::where('user_id', $user->id)
            ->with(['order', 'reward'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($point) {
                return [
                    'date' => $point->created_at->format('Y-m-d'),
                    'points' => $point->points,
                    'type' => $point->type,
                    'description' => $point->description,
                    'expires_at' => $point->expires_at?->format('Y-m-d'),
                    'order_number' => $point->order?->number,
                    'reward_name' => $point->reward?->name
                ];
            });
    }
} 