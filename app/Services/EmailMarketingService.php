<?php

namespace App\Services;

use App\Models\User;
use App\Models\EmailCampaign;
use App\Models\Product;
use App\Mail\PromotionalEmail;
use App\Mail\AbandonedCartEmail;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class EmailMarketingService
{
    public function createCampaign(array $data): EmailCampaign
    {
        return EmailCampaign::create([
            'name' => $data['name'],
            'subject' => $data['subject'],
            'content' => $data['content'],
            'target_segment' => $data['target_segment'],
            'scheduled_at' => $data['scheduled_at'] ?? now(),
            'status' => 'scheduled'
        ]);
    }

    public function sendAbandonedCartEmails(): void
    {
        $abandonedCarts = Cart::where('updated_at', '<=', now()->subHours(24))
            ->where('status', 'active')
            ->with(['user', 'items.product'])
            ->get();

        foreach ($abandonedCarts as $cart) {
            Mail::to($cart->user)->send(new AbandonedCartEmail($cart));
            
            $cart->email_reminders()->create([
                'type' => 'abandoned_cart',
                'sent_at' => now()
            ]);
        }
    }

    public function sendProductRecommendations(User $user): void
    {
        $recommendations = $this->getPersonalizedRecommendations($user);
        
        if ($recommendations->isNotEmpty()) {
            Mail::to($user)->send(new ProductRecommendationsEmail($recommendations));
        }
    }

    private function getPersonalizedRecommendations(User $user)
    {
        // Get user's purchase history categories
        $userCategories = $user->orders()
            ->with('items.product.category')
            ->get()
            ->pluck('items.*.product.category_id')
            ->flatten()
            ->unique();

        // Get similar products
        return Product::whereIn('category_id', $userCategories)
            ->where('stock', '>', 0)
            ->whereDoesntHave('orders', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->inRandomOrder()
            ->take(5)
            ->get();
    }

    public function trackEmailEngagement(string $campaignId, string $userId, string $action): void
    {
        EmailEngagement::create([
            'campaign_id' => $campaignId,
            'user_id' => $userId,
            'action' => $action,
            'timestamp' => now()
        ]);
    }
} 