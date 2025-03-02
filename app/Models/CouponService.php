<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\Order;
use App\Models\User;
use Carbon\Carbon;

class CouponService
{
    public function validateCoupon(string $code, User $user, float $cartTotal): array
    {
        $coupon = Coupon::where('code', $code)
            ->where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>', now())
            ->first();

        if (!$coupon) {
            return [
                'valid' => false,
                'message' => 'Invalid or expired coupon code'
            ];
        }

        // Check usage limit
        if ($coupon->usage_limit && $coupon->times_used >= $coupon->usage_limit) {
            return [
                'valid' => false,
                'message' => 'Coupon usage limit reached'
            ];
        }

        // Check user usage limit
        if ($coupon->user_usage_limit) {
            $userUsage = $coupon->orders()
                ->where('user_id', $user->id)
                ->count();

            if ($userUsage >= $coupon->user_usage_limit) {
                return [
                    'valid' => false,
                    'message' => 'You have reached the maximum usage limit for this coupon'
                ];
            }
        }

        // Check minimum order amount
        if ($coupon->minimum_amount && $cartTotal < $coupon->minimum_amount) {
            return [
                'valid' => false,
                'message' => "Minimum order amount of ${$coupon->minimum_amount} required"
            ];
        }

        // Check user eligibility
        if ($coupon->user_type && $user->type !== $coupon->user_type) {
            return [
                'valid' => false,
                'message' => 'This coupon is not available for your account type'
            ];
        }

        // Calculate discount
        $discount = $coupon->type === 'percentage'
            ? $cartTotal * ($coupon->value / 100)
            : $coupon->value;

        // Apply maximum discount if set
        if ($coupon->maximum_discount && $discount > $coupon->maximum_discount) {
            $discount = $coupon->maximum_discount;
        }

        return [
            'valid' => true,
            'coupon' => $coupon,
            'discount' => $discount,
            'message' => 'Coupon applied successfully'
        ];
    }

    public function applyCoupon(Order $order, Coupon $coupon)
    {
        $order->update([
            'coupon_id' => $coupon->id,
            'discount_amount' => $this->calculateDiscount($order, $coupon),
        ]);

        $coupon->increment('times_used');
    }

    private function calculateDiscount(Order $order, Coupon $coupon): float
    {
        $subtotal = $order->items->sum(function ($item) {
            return $item->price * $item->quantity;
        });

        if ($coupon->type === 'percentage') {
            $discount = $subtotal * ($coupon->value / 100);
        } else {
            $discount = $coupon->value;
        }

        if ($coupon->maximum_discount) {
            $discount = min($discount, $coupon->maximum_discount);
        }

        return $discount;
    }
} 