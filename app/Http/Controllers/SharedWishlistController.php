<?php

namespace App\Http\Controllers;

use App\Models\SharedWishlist;
use App\Models\Wishlist;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SharedWishlistController extends Controller
{
    public function create()
    {
        $wishlistItems = auth()->user()->wishlist()
            ->with('product.images')
            ->get();

        return Inertia::render('Wishlist/Share', [
            'wishlistItems' => $wishlistItems
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'visibility' => 'required|in:public,private',
            'expires_at' => 'nullable|date|after:now',
            'items' => 'required|array|min:1',
            'items.*' => 'exists:products,id'
        ]);

        $sharedWishlist = SharedWishlist::create([
            'user_id' => auth()->id(),
            'name' => $request->name,
            'description' => $request->description,
            'visibility' => $request->visibility,
            'expires_at' => $request->expires_at
        ]);

        foreach ($request->items as $productId) {
            $sharedWishlist->items()->create([
                'product_id' => $productId
            ]);
        }

        return redirect()->route('shared-wishlists.show', $sharedWishlist->share_code)
            ->with('success', 'Wishlist shared successfully!');
    }

    public function show($shareCode)
    {
        $sharedWishlist = SharedWishlist::where('share_code', $shareCode)
            ->with(['items.product.images', 'user'])
            ->firstOrFail();

        if (!$sharedWishlist->isPublic() && $sharedWishlist->user_id !== auth()->id()) {
            abort(403);
        }

        if ($sharedWishlist->isExpired()) {
            abort(404, 'This shared wishlist has expired');
        }

        return Inertia::render('Wishlist/SharedShow', [
            'sharedWishlist' => $sharedWishlist
        ]);
    }

    public function copyToMyWishlist(SharedWishlist $sharedWishlist)
    {
        foreach ($sharedWishlist->items as $item) {
            auth()->user()->wishlist()->firstOrCreate([
                'product_id' => $item->product_id
            ]);
        }

        return back()->with('success', 'Items added to your wishlist');
    }
} 