<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;
use App\Http\Requests\ReviewRequest;
use Illuminate\Support\Facades\Storage;

class ReviewController extends Controller
{
    public function store(ReviewRequest $request, Product $product)
    {
        $review = $product->reviews()->create([
            'user_id' => auth()->id(),
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('reviews', 'public');
                $review->images()->create(['image_path' => $path]);
            }
        }

        return back()->with('success', 'Review submitted successfully!');
    }

    public function helpful(Review $review)
    {
        $review->increment('helpful_count');
        return response()->json(['helpful_count' => $review->helpful_count]);
    }
} 