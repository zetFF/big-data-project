<?php

namespace App\Services;

use App\Models\Product;
use App\Models\SocialPost;
use Facebook\Facebook;
use Abraham\TwitterOAuth\TwitterOAuth;
use Instagram\Instagram;

class SocialMediaService
{
    protected $facebook;
    protected $twitter;
    protected $instagram;

    public function __construct()
    {
        $this->facebook = new Facebook([
            'app_id' => config('services.facebook.client_id'),
            'app_secret' => config('services.facebook.client_secret'),
            'default_graph_version' => 'v12.0',
        ]);

        $this->twitter = new TwitterOAuth(
            config('services.twitter.client_id'),
            config('services.twitter.client_secret'),
            config('services.twitter.access_token'),
            config('services.twitter.access_token_secret')
        );

        $this->instagram = new Instagram([
            'client_id' => config('services.instagram.client_id'),
            'client_secret' => config('services.instagram.client_secret'),
            'access_token' => config('services.instagram.access_token'),
        ]);
    }

    public function shareProduct(Product $product, array $platforms): array
    {
        $results = [];

        foreach ($platforms as $platform) {
            try {
                switch ($platform) {
                    case 'facebook':
                        $results['facebook'] = $this->shareToFacebook($product);
                        break;
                    case 'twitter':
                        $results['twitter'] = $this->shareToTwitter($product);
                        break;
                    case 'instagram':
                        $results['instagram'] = $this->shareToInstagram($product);
                        break;
                }
            } catch (\Exception $e) {
                logger()->error("Social sharing failed for {$platform}", [
                    'product_id' => $product->id,
                    'error' => $e->getMessage()
                ]);
                $results[$platform] = false;
            }
        }

        $this->recordSocialShare($product, $results);
        return $results;
    }

    private function shareToFacebook(Product $product): string
    {
        $response = $this->facebook->post('/me/feed', [
            'message' => $this->generateProductMessage($product),
            'link' => route('products.show', $product),
            'picture' => $product->primary_image
        ]);

        return $response->getGraphNode()['id'];
    }

    private function shareToTwitter(Product $product): string
    {
        $tweet = $this->twitter->post('tweets', [
            'text' => $this->generateProductTweet($product),
            'media' => [
                'media_ids' => [$this->uploadTwitterMedia($product->primary_image)]
            ]
        ], true);

        return $tweet->data->id;
    }

    private function generateProductMessage(Product $product): string
    {
        return sprintf(
            "🆕 New Product Alert!\n\n%s\n\nPrice: $%s\n\nShop now at %s",
            $product->name,
            number_format($product->price, 2),
            route('products.show', $product)
        );
    }

    private function recordSocialShare(Product $product, array $results): void
    {
        SocialPost::create([
            'product_id' => $product->id,
            'platforms' => $results,
            'engagement_metrics' => [],
            'shared_at' => now()
        ]);
    }

    public function getEngagementMetrics(Product $product): array
    {
        $metrics = [
            'facebook' => $this->getFacebookMetrics($product),
            'twitter' => $this->getTwitterMetrics($product),
            'instagram' => $this->getInstagramMetrics($product)
        ];

        return $metrics;
    }
} 