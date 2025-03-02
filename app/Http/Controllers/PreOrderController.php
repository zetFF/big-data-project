<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\PreOrder;
use App\Services\PreOrderService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PreOrderController extends Controller
{
    protected $preOrderService;

    public function __construct(PreOrderService $preOrderService)
    {
        $this->preOrderService = $preOrderService;
    }

    public function create(Product $product)
    {
        return Inertia::render('PreOrder/Create', [
            'product' => $product->load('images'),
            'depositPercentage' => config('shop.preorder_deposit_percentage', 20)
        ]);
    }

    public function store(Request $request, Product $product)
    {
        $validatedData = $request->validate([
            'quantity' => 'required|integer|min:1',
            'payment_method' => 'required|string'
        ]);

        $preOrder = $this->preOrderService->createPreOrder(
            auth()->user(),
            $product,
            $validatedData['quantity'],
            $validatedData['payment_method']
        );

        return redirect()->route('pre-orders.show', $preOrder)
            ->with('success', 'Pre-order placed successfully!');
    }

    public function show(PreOrder $preOrder)
    {
        $this->authorize('view', $preOrder);

        return Inertia::render('PreOrder/Show', [
            'preOrder' => $preOrder->load(['product.images', 'user'])
        ]);
    }

    public function payRemainingBalance(PreOrder $preOrder, Request $request)
    {
        $this->authorize('update', $preOrder);

        $validatedData = $request->validate([
            'payment_method' => 'required|string'
        ]);

        $this->preOrderService->processRemainingPayment(
            $preOrder,
            $validatedData['payment_method']
        );

        return back()->with('success', 'Payment processed successfully!');
    }
} 