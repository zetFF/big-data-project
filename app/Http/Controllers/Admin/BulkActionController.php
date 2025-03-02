<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Order;
use App\Models\User;

class BulkActionController extends Controller
{
    public function products(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'action' => 'required|string|in:activate,deactivate,delete,update_stock',
            'value' => 'required_if:action,update_stock|numeric|min:0',
        ]);

        $products = Product::whereIn('id', $request->ids);

        switch ($request->action) {
            case 'activate':
                $products->update(['is_active' => true]);
                break;
            case 'deactivate':
                $products->update(['is_active' => false]);
                break;
            case 'delete':
                $products->delete();
                break;
            case 'update_stock':
                $products->update(['stock' => $request->value]);
                break;
        }

        return back()->with('success', 'Bulk action completed successfully');
    }

    public function orders(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'action' => 'required|string|in:update_status',
            'status' => 'required_if:action,update_status|string|in:processing,completed,cancelled',
        ]);

        Order::whereIn('id', $request->ids)
            ->update(['status' => $request->status]);

        return back()->with('success', 'Orders updated successfully');
    }

    public function users(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'action' => 'required|string|in:activate,deactivate,delete',
        ]);

        $users = User::whereIn('id', $request->ids);

        switch ($request->action) {
            case 'activate':
                $users->update(['is_active' => true]);
                break;
            case 'deactivate':
                $users->update(['is_active' => false]);
                break;
            case 'delete':
                $users->delete();
                break;
        }

        return back()->with('success', 'Users updated successfully');
    }
} 