<?php

namespace App\Exports;

use App\Models\Order;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class SalesExport implements FromQuery, WithHeadings, WithMapping
{
    public function __construct(
        protected $startDate,
        protected $endDate
    ) {}

    public function query()
    {
        return Order::query()
            ->whereBetween('created_at', [$this->startDate, $this->endDate])
            ->where('status', 'completed')
            ->with(['user', 'items.product']);
    }

    public function headings(): array
    {
        return [
            'Order Number',
            'Customer',
            'Total Amount',
            'Items',
            'Status',
            'Date',
        ];
    }

    public function map($order): array
    {
        return [
            $order->order_number,
            $order->user->name,
            $order->total_amount,
            $order->items->map(fn($item) => $item->product->name)->implode(', '),
            $order->status,
            $order->created_at->format('Y-m-d H:i:s'),
        ];
    }
} 