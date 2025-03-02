<?php

namespace App\Services;

use App\Models\GiftCard;
use App\Models\User;
use App\Models\Order;
use App\Notifications\GiftCardPurchased;
use App\Notifications\GiftCardReceived;
use Illuminate\Support\Str;
use Carbon\Carbon;

class GiftCardService
{
    public function createGiftCard(array $data, User $purchaser): GiftCard
    {
        $giftCard = GiftCard::create([
            'code' => $this->generateUniqueCode(),
            'amount' => $data['amount'],
            'purchaser_id' => $purchaser->id,
            'recipient_email' => $data['recipient_email'],
            'recipient_name' => $data['recipient_name'],
            'message' => $data['message'] ?? null,
            'expires_at' => now()->addYears(1),
            'status' => 'active',
            'design_template' => $data['design_template'] ?? 'default',
            'delivery_date' => $data['delivery_date'] ?? now()
        ]);

        // Schedule notifications
        if ($giftCard->delivery_date->isFuture()) {
            $this->scheduleGiftCardDelivery($giftCard);
        } else {
            $this->sendGiftCardNotifications($giftCard);
        }

        return $giftCard;
    }

    public function redeemGiftCard(string $code, User $user): float
    {
        $giftCard = GiftCard::where('code', $code)
            ->where('status', 'active')
            ->where('expires_at', '>', now())
            ->firstOrFail();

        if ($giftCard->recipient_email && $giftCard->recipient_email !== $user->email) {
            throw new \Exception('This gift card belongs to another user');
        }

        $giftCard->update([
            'redeemed_by' => $user->id,
            'redeemed_at' => now(),
            'status' => 'redeemed'
        ]);

        return $giftCard->amount;
    }

    public function applyToOrder(GiftCard $giftCard, Order $order): void
    {
        if ($giftCard->amount > $order->total_amount) {
            $remainingBalance = $giftCard->amount - $order->total_amount;
            
            // Create new gift card with remaining balance
            $this->createGiftCard([
                'amount' => $remainingBalance,
                'recipient_email' => $giftCard->redeemed_by->email,
                'recipient_name' => $giftCard->redeemed_by->name,
                'message' => 'Remaining balance from gift card ' . $giftCard->code
            ], $giftCard->redeemed_by);
            
            $appliedAmount = $order->total_amount;
        } else {
            $appliedAmount = $giftCard->amount;
        }

        $order->update([
            'gift_card_amount' => $appliedAmount,
            'total_amount' => $order->total_amount - $appliedAmount
        ]);

        $giftCard->update(['status' => 'used']);
    }

    private function generateUniqueCode(): string
    {
        do {
            $code = strtoupper(Str::random(16));
        } while (GiftCard::where('code', $code)->exists());

        return $code;
    }

    private function scheduleGiftCardDelivery(GiftCard $giftCard): void
    {
        // Schedule email delivery
        $delay = $giftCard->delivery_date->diffInSeconds(now());
        
        \Queue::later($delay, new SendGiftCardEmail($giftCard));
    }

    private function sendGiftCardNotifications(GiftCard $giftCard): void
    {
        // Notify purchaser
        $giftCard->purchaser->notify(new GiftCardPurchased($giftCard));

        // Notify recipient
        \Notification::route('mail', $giftCard->recipient_email)
            ->notify(new GiftCardReceived($giftCard));
    }

    public function checkBalance(string $code): float
    {
        $giftCard = GiftCard::where('code', $code)
            ->where('status', 'active')
            ->firstOrFail();

        return $giftCard->amount;
    }
} 