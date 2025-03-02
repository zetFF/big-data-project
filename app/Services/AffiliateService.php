<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use App\Models\Affiliate;
use App\Models\AffiliateCommission;
use App\Models\AffiliateLink;
use Illuminate\Support\Str;

class AffiliateService
{
    public function createAffiliate(User $user, array $data)
    {
        return Affiliate::create([
            'user_id' => $user->id,
            'referral_code' => $this->generateReferralCode($user),
            'commission_rate' => $data['commission_rate'] ?? 5.0, // Default 5%
            'payment_info' => $data['payment_info'] ?? null,
            'status' => 'active'
        ]);
    }

    public function processOrderCommission(Order $order)
    {
        if (!$order->user->referred_by) {
            return null;
        }

        $affiliate = Affiliate::where('user_id', $order->user->referred_by)
            ->where('status', 'active')
            ->first();

        if (!$affiliate) {
            return null;
        }

        $commissionAmount = $order->total_amount * ($affiliate->commission_rate / 100);

        return AffiliateCommission::create([
            'affiliate_id' => $affiliate->id,
            'order_id' => $order->id,
            'amount' => $commissionAmount,
            'status' => 'pending'
        ]);
    }

    private function generateReferralCode(User $user): string
    {
        $code = Str::slug($user->name) . '-' . Str::random(8);
        
        while (Affiliate::where('referral_code', $code)->exists()) {
            $code = Str::slug($user->name) . '-' . Str::random(8);
        }

        return $code;
    }

    public function generateAffiliateLink(User $affiliate, string $targetUrl): AffiliateLink
    {
        return AffiliateLink::create([
            'user_id' => $affiliate->id,
            'target_url' => $targetUrl,
            'tracking_code' => $this->generateTrackingCode(),
            'expires_at' => now()->addMonths(3)
        ]);
    }

    public function trackReferral(string $trackingCode): void
    {
        $affiliateLink = AffiliateLink::where('tracking_code', $trackingCode)
            ->where('expires_at', '>', now())
            ->first();

        if ($affiliateLink) {
            session(['affiliate_tracking' => [
                'code' => $trackingCode,
                'expires_at' => now()->addDays(30)
            ]]);
        }
    }

    public function processCommission(Order $order): void
    {
        $trackingData = session('affiliate_tracking');
        
        if (!$trackingData || now()->gt($trackingData['expires_at'])) {
            return;
        }

        $affiliateLink = AffiliateLink::where('tracking_code', $trackingData['code'])->first();
        
        if (!$affiliateLink) {
            return;
        }

        $commission = $this->calculateCommission($order, $affiliateLink->user);
        
        AffiliateCommission::create([
            'user_id' => $affiliateLink->user_id,
            'order_id' => $order->id,
            'amount' => $commission,
            'status' => 'pending'
        ]);
    }

    public function calculateCommission(Order $order, User $affiliate): float
    {
        $baseRate = $this->getAffiliateRate($affiliate);
        $commission = $order->total_amount * ($baseRate / 100);

        // Apply tier bonuses
        if ($order->total_amount >= 1000) {
            $commission *= 1.2; // 20% bonus for large orders
        }

        return round($commission, 2);
    }

    public function getAffiliateStats(User $affiliate): array
    {
        $commissions = AffiliateCommission::where('user_id', $affiliate->id);

        return [
            'total_earnings' => $commissions->sum('amount'),
            'pending_earnings' => $commissions->where('status', 'pending')->sum('amount'),
            'paid_earnings' => $commissions->where('status', 'paid')->sum('amount'),
            'total_referrals' => $commissions->count(),
            'conversion_rate' => $this->calculateConversionRate($affiliate),
            'monthly_earnings' => $this->getMonthlyEarnings($affiliate)
        ];
    }

    private function generateTrackingCode(): string
    {
        return Str::random(10);
    }

    private function getAffiliateRate(User $affiliate): float
    {
        // Base commission rate is 5%
        $baseRate = 5.0;

        // Increase rate based on performance
        $totalEarnings = AffiliateCommission::where('user_id', $affiliate->id)
            ->where('status', 'paid')
            ->sum('amount');

        if ($totalEarnings >= 10000) {
            return 8.0; // Top tier
        } elseif ($totalEarnings >= 5000) {
            return 7.0; // Mid tier
        } elseif ($totalEarnings >= 1000) {
            return 6.0; // Entry tier
        }

        return $baseRate;
    }

    private function calculateConversionRate(User $affiliate): float
    {
        $totalClicks = AffiliateLink::where('user_id', $affiliate->id)
            ->sum('click_count');

        $totalConversions = AffiliateCommission::where('user_id', $affiliate->id)
            ->count();

        return $totalClicks > 0 
            ? ($totalConversions / $totalClicks) * 100 
            : 0;
    }
} 