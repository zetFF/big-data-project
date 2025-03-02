<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkOrderRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'shipping_address' => 'required|string',
            'payment_method' => 'required|in:credit_card,bank_transfer'
        ];
    }
} 