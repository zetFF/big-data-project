<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\VideoReview;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class VideoReviewController extends Controller
{
    public function index(Product $product)
    {
        $videos = $product->videoReviews()
            ->with('user')
            ->where('status', 'approved')
            ->orderBy('likes_count', 'desc')
            ->paginate(12);

        return Inertia::render('Reviews/VideoIndex', [
            'product' => $product,
            'videos' => $videos
        ]);
    }

    public function store(Request $request, Product $product)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'video' => 'required|file|mimetypes:video/mp4,video/quicktime|max:100000',
            'thumbnail' => 'required|image|max:2048'
        ]);

        $videoPath = $request->file('video')->store('video-reviews', 'public');
        $thumbnailPath = $request->file('thumbnail')->store('video-reviews/thumbnails', 'public');

        $videoReview = $product->videoReviews()->create([
            'user_id' => auth()->id(),
            'title' => $request->title,
            'description' => $request->description,
            'video_url' => Storage::url($videoPath),
            'thumbnail_url' => Storage::url($thumbnailPath),
            'status' => 'pending',
            'duration' => $this->getVideoDuration($videoPath)
        ]);

        return redirect()->route('products.video-reviews.index', $product)
            ->with('success', 'Video review submitted successfully and pending approval');
    }

    public function toggleLike(VideoReview $videoReview)
    {
        $liked = $videoReview->toggleLike(auth()->user());

        return response()->json([
            'liked' => $liked,
            'likesCount' => $videoReview->likes_count
        ]);
    }

    private function getVideoDuration($videoPath): int
    {
        $ffprobe = \FFMpeg\FFProbe::create();
        $duration = $ffprobe
            ->format(storage_path('app/public/' . $videoPath))
            ->get('duration');

        return (int) $duration;
    }
} 