<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ProductService
{
    public function create(array $data, array $images = []): Product
    {
        $data['slug'] = Str::slug($data['name']);
        $product = auth()->user()->vendorProfile->products()->create($data);

        if (!empty($images)) {
            foreach ($images as $index => $image) {
                $path = $image->store('products', 'public');
                $product->images()->create([
                    'image' => $path,
                    'is_primary' => $index === 0,
                    'sort_order' => $index
                ]);
            }
        }

        return $product;
    }

    public function update(Product $product, array $data, array $images = []): Product
    {
        if (isset($data['name']) && $data['name'] !== $product->name) {
            $data['slug'] = Str::slug($data['name']);
        }

        $product->update($data);

        if (!empty($images)) {
            // Delete old images
            foreach ($product->images as $image) {
                Storage::disk('public')->delete($image->image);
            }
            $product->images()->delete();

            // Add new images
            foreach ($images as $index => $image) {
                $path = $image->store('products', 'public');
                $product->images()->create([
                    'image' => $path,
                    'is_primary' => $index === 0,
                    'sort_order' => $index
                ]);
            }
        }

        return $product;
    }
} 