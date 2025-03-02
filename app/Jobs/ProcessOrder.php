<?php

namespace App\Jobs;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessOrder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        protected Order $order
    ) {}

    public function handle(): void
    {
        // Update stock levels
        foreach ($this->order->items as $item) {
            $item->product->decrement('stock', $item->quantity);
        }

        // Process payment
        $paymentProcessor = $this->getPaymentProcessor();
        $paymentResult = $paymentProcessor->process($this->order);

        if ($paymentResult->success) {
            $this->order->update([
                'status' => 'processing',
                'payment_status' => 'paid',
                'paid_at' => now(),
            ]);
        } else {
            $this->order->update([
                'status' => 'payment_failed',
                'payment_status' => 'failed',
            ]);
        }
    }

    protected function getPaymentProcessor()
    {
        // Implementation depends on payment method
        return match($this->order->payment_method) {
            'credit_card' => new CreditCardProcessor(),
            'bank_transfer' => new BankTransferProcessor(),
            'e_wallet' => new EWalletProcessor(),
            default => throw new \Exception('Invalid payment method'),
        };
    }
} 