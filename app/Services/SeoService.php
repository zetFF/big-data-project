<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Category;
use Spatie\SchemaOrg\Schema;
use Spatie\Sitemap\SitemapGenerator;
use Illuminate\Support\Str;

class SeoService
{
    public function generateProductSchema(Product $product)
    {
        return Schema::product()
            ->name($product->name)
            ->description($product->description)
            ->image($product->primary_image)
            ->sku($product->id)
            ->brand(Schema::brand()->name($product->vendor->shop_name))
            ->offers(Schema::offer()
                ->price($product->price)
                ->priceCurrency('USD')
                ->availability($product->stock > 0 
                    ? 'https://schema.org/InStock' 
                    : 'https://schema.org/OutOfStock')
            )
            ->aggregateRating(Schema::aggregateRating()
                ->ratingValue($product->reviews_avg_rating ?? 0)
                ->reviewCount($product->reviews_count ?? 0)
            )
            ->toArray();
    }

    public function generateMetaTags($data)
    {
        return [
            'title' => $data['title'] ?? config('app.name'),
            'description' => $data['description'] ?? config('app.description'),
            'keywords' => $data['keywords'] ?? config('app.keywords'),
            'og:title' => $data['title'] ?? config('app.name'),
            'og:description' => $data['description'] ?? config('app.description'),
            'og:image' => $data['image'] ?? config('app.logo'),
            'og:url' => url()->current(),
            'twitter:card' => 'summary_large_image',
        ];
    }

    public function generateProductMetadata(Product $product): array
    {
        return [
            'title' => $this->generateSeoTitle($product),
            'description' => $this->generateSeoDescription($product),
            'keywords' => $this->generateKeywords($product),
            'og:title' => $product->name,
            'og:description' => Str::limit(strip_tags($product->description), 160),
            'og:image' => $product->primary_image,
            'og:type' => 'product',
            'product:price:amount' => $product->price,
            'product:price:currency' => 'USD',
            'twitter:card' => 'product',
            'twitter:title' => $product->name,
            'twitter:description' => Str::limit(strip_tags($product->description), 160),
            'twitter:image' => $product->primary_image
        ];
    }

    public function generateSitemap(): void
    {
        SitemapGenerator::create(config('app.url'))
            ->hasCrawled(function ($url) {
                return [
                    'url' => $url,
                    'changefreq' => 'daily',
                    'priority' => 0.8
                ];
            })
            ->writeToFile(public_path('sitemap.xml'));
    }

    public function generateStructuredData(Product $product): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'Product',
            'name' => $product->name,
            'description' => $product->description,
            'image' => $product->images->pluck('url')->toArray(),
            'sku' => $product->sku,
            'brand' => [
                '@type' => 'Brand',
                'name' => $product->brand->name ?? config('app.name')
            ],
            'offers' => [
                '@type' => 'Offer',
                'url' => route('products.show', $product),
                'priceCurrency' => 'USD',
                'price' => $product->price,
                'availability' => $product->stock > 0 
                    ? 'https://schema.org/InStock' 
                    : 'https://schema.org/OutOfStock'
            ]
        ];
    }

    private function generateSeoTitle(Product $product): string
    {
        return "{$product->name} - {$product->category->name} | " . config('app.name');
    }

    private function generateSeoDescription(Product $product): string
    {
        return Str::limit(
            strip_tags($product->description), 
            160, 
            '... Buy now at ' . config('app.name')
        );
    }

    private function generateKeywords(Product $product): string
    {
        $keywords = collect([
            $product->name,
            $product->category->name,
            $product->brand->name ?? '',
            ...explode(' ', $product->name),
            ...explode(' ', $product->category->name)
        ]);

        return $keywords->filter()
            ->unique()
            ->take(10)
            ->implode(', ');
    }
} 