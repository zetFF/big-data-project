<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use Stripe\StripeClient;
use PayPal\Rest\ApiContext;
use PayPal\Auth\OAuthTokenCredential;
use Exception;

class PaymentGatewayService
{
    protected $stripe;
    protected $paypalContext;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('services.stripe.secret'));
        
        $this->paypalContext = new ApiContext(
            new OAuthTokenCredential(
                config('services.paypal.client_id'),
                config('services.paypal.secret')
            )
        );
    }

    public function processPayment(Order $order, array $paymentData): Payment
    {
        try {
            switch ($paymentData['method']) {
                case 'stripe':
                    return $this->processStripePayment($order, $paymentData);
                case 'paypal':
                    return $this->processPayPalPayment($order, $paymentData);
                default:
                    throw new Exception('Unsupported payment method');
            }
        } catch (Exception $e) {
            logger()->error('Payment processing failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    private function processStripePayment(Order $order, array $paymentData): Payment
    {
        $paymentIntent = $this->stripe->paymentIntents->create([
            'amount' => $order->total_amount * 100, // Convert to cents
            'currency' => 'usd',
            'payment_method' => $paymentData['payment_method_id'],
            'confirm' => true,
            'metadata' => [
                'order_id' => $order->id
            ]
        ]);

        return Payment::create([
            'order_id' => $order->id,
            'amount' => $order->total_amount,
            'payment_method' => 'stripe',
            'transaction_id' => $paymentIntent->id,
            'status' => $paymentIntent->status === 'succeeded' ? 'completed' : 'pending'
        ]);
    }

    private function processPayPalPayment(Order $order, array $paymentData): Payment
    {
        // PayPal payment processing logic here
        // This is a simplified version
        return Payment::create([
            'order_id' => $order->id,
            'amount' => $order->total_amount,
            'payment_method' => 'paypal',
            'transaction_id' => $paymentData['paypal_order_id'],
            'status' => 'completed'
        ]);
    }

    public function handleWebhook(string $provider, array $payload): void
    {
        switch ($provider) {
            case 'stripe':
                $this->handleStripeWebhook($payload);
                break;
            case 'paypal':
                $this->handlePayPalWebhook($payload);
                break;
        }
    }

    private function handleStripeWebhook(array $payload): void
    {
        if ($payload['type'] === 'payment_intent.succeeded') {
            $payment = Payment::where('transaction_id', $payload['data']['object']['id'])->first();
            if ($payment) {
                $payment->update(['status' => 'completed']);
                $payment->order->update(['payment_status' => 'paid']);
            }
        }
    }
} 