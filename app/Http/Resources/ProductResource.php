<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => $this->price,
            'stock' => $this->stock,
            'weight' => $this->weight,
            'is_active' => $this->is_active,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'vendor' => new VendorResource($this->whenLoaded('vendor')),
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
            'primary_image' => $this->images->where('is_primary', true)->first()?->image,
            'rating_average' => $this->reviews->avg('rating'),
            'reviews_count' => $this->reviews->count(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
} 