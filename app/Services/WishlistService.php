<?php

namespace App\Services;

use App\Models\User;
use App\Models\Product;
use App\Models\Wishlist;
use App\Notifications\WishlistItemBackInStock;
use App\Notifications\WishlistItemPriceDropped;

class WishlistService
{
    public function addToWishlist(User $user, Product $product): Wishlist
    {
        $wishlistItem = Wishlist::firstOrCreate([
            'user_id' => $user->id,
            'product_id' => $product->id
        ], [
            'added_price' => $product->price
        ]);

        $this->checkAndNotifyPriceChange($wishlistItem);
        return $wishlistItem;
    }

    public function removeFromWishlist(User $user, Product $product): void
    {
        Wishlist::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->delete();
    }

    public function getWishlist(User $user): array
    {
        $wishlistItems = Wishlist::where('user_id', $user->id)
            ->with('product')
            ->get();

        return [
            'items' => $wishlistItems,
            'total_value' => $wishlistItems->sum(function ($item) {
                return $item->product->price;
            }),
            'price_drops' => $wishlistItems->filter(function ($item) {
                return $item->product->price < $item->added_price;
            })->count(),
            'out_of_stock' => $wishlistItems->filter(function ($item) {
                return $item->product->stock === 0;
            })->count()
        ];
    }

    public function checkAndNotifyPriceChange(Wishlist $wishlistItem): void
    {
        $priceDropThreshold = $wishlistItem->added_price * 0.9; // 10% drop

        if ($wishlistItem->product->price <= $priceDropThreshold) {
            $wishlistItem->user->notify(new WishlistItemPriceDropped($wishlistItem));
        }
    }

    public function notifyBackInStock(Product $product): void
    {
        Wishlist::where('product_id', $product->id)
            ->whereHas('product', function ($query) {
                $query->where('stock', '>', 0);
            })
            ->get()
            ->each(function ($wishlistItem) {
                $wishlistItem->user->notify(new WishlistItemBackInStock($wishlistItem));
            });
    }

    public function moveToCart(User $user, Product $product): void
    {
        // Add to cart
        $user->cart()->updateOrCreate(
            ['product_id' => $product->id],
            ['quantity' => 1]
        );

        // Remove from wishlist
        $this->removeFromWishlist($user, $product);
    }

    public function shareWishlist(User $user, string $medium): string
    {
        $wishlistItems = $this->getWishlist($user)['items'];
        
        switch ($medium) {
            case 'email':
                return $this->generateEmailShareLink($wishlistItems);
            case 'whatsapp':
                return $this->generateWhatsAppShareLink($wishlistItems);
            default:
                return route('wishlist.shared', ['user' => $user->id]);
        }
    }
} 