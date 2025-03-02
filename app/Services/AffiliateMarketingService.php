<?php

namespace App\Services;

use App\Models\User;
use App\Models\Order;
use App\Models\AffiliateMarketing;
use App\Models\AffiliateReferral;
use Illuminate\Support\Str;

class AffiliateMarketingService
{
    public function createAffiliate(User $user, array $data): AffiliateMarketing
    {
        return AffiliateMarketing::create([
            'user_id' => $user->id,
            'referral_code' => $this->generateReferralCode($user),
            'commission_rate' => $data['commission_rate'] ?? 5.0,
            'status' => 'active',
            'payout_method' => $data['payout_method'] ?? null,
            'payout_details' => $data['payout_details'] ?? null,
        ]);
    }

    public function trackReferral(string $referralCode, User $referredUser): ?AffiliateReferral
    {
        $affiliate = AffiliateMarketing::where('referral_code', $referralCode)
            ->where('status', 'active')
            ->first();

        if (!$affiliate || $affiliate->user_id === $referredUser->id) {
            return null;
        }

        return AffiliateReferral::create([
            'affiliate_marketing_id' => $affiliate->id,
            'referred_user_id' => $referredUser->id,
            'status' => 'pending'
        ]);
    }

    public function processOrderCommission(Order $order): void
    {
        $referral = AffiliateReferral::where('referred_user_id', $order->user_id)
            ->where('status', 'pending')
            ->first();

        if (!$referral) {
            return;
        }

        $affiliate = $referral->affiliateMarketing;
        $commission = $affiliate->calculateCommission($order->total_amount);

        $affiliate->commissions()->create([
            'order_id' => $order->id,
            'amount' => $commission,
            'status' => 'pending'
        ]);

        $affiliate->increment('earnings', $commission);
        $referral->update(['status' => 'converted']);
    }

    private function generateReferralCode(User $user): string
    {
        $code = Str::slug($user->name) . '-' . Str::random(8);
        
        while (AffiliateMarketing::where('referral_code', $code)->exists()) {
            $code = Str::slug($user->name) . '-' . Str::random(8);
        }

        return $code;
    }
} 