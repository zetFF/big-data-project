<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\SeoService;
use Inertia\Inertia;

class SeoMiddleware
{
    public function __construct(
        protected SeoService $seoService
    ) {}

    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        if (method_exists($response, 'withViewData')) {
            $seoData = [];
            
            // Generate SEO data based on current route
            if ($request->route()->getName() === 'products.show') {
                $product = $request->route()->parameter('product');
                $seoData = [
                    'title' => $product->name . ' | ' . config('app.name'),
                    'description' => $product->description,
                    'keywords' => $product->category->name . ',' . $product->tags->pluck('name')->implode(','),
                    'image' => $product->primary_image,
                ];
            }

            $metaTags = $this->seoService->generateMetaTags($seoData);
            
            $response->withViewData(['metaTags' => $metaTags]);
        }

        return $response;
    }
} 