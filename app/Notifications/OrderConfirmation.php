<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class OrderConfirmation extends Notification
{
    use Queueable;

    public function __construct(
        public Order $order
    ) {}

    public function via($notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Order Confirmation #' . $this->order->order_number)
            ->line('Thank you for your order!')
            ->line('Order Number: ' . $this->order->order_number)
            ->line('Total Amount: $' . $this->order->total_amount)
            ->action('View Order', route('orders.show', $this->order))
            ->line('Thank you for shopping with us!');
    }

    public function toArray($notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'amount' => $this->order->total_amount,
            'status' => $this->order->status,
        ];
    }
} 