<?php

namespace App\Services;

use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;

class LanguageService
{
    private array $availableLocales = ['en', 'es', 'fr', 'de', 'id'];

    public function setLocale(string $locale): void
    {
        if (in_array($locale, $this->availableLocales)) {
            App::setLocale($locale);
            session()->put('locale', $locale);
        }
    }

    public function getAvailableLocales(): array
    {
        return $this->availableLocales;
    }

    public function getCurrentLocale(): string
    {
        return App::getLocale();
    }

    public function loadTranslations(string $locale): array
    {
        return Cache::remember("translations.{$locale}", 3600, function () use ($locale) {
            $path = resource_path("lang/{$locale}.json");
            if (File::exists($path)) {
                return json_decode(File::get($path), true);
            }
            return [];
        });
    }

    public function translateProduct($product, string $locale): array
    {
        $translations = $this->loadTranslations($locale);
        
        return [
            'name' => $translations["products.{$product->id}.name"] ?? $product->name,
            'description' => $translations["products.{$product->id}.description"] ?? $product->description,
            'features' => collect($product->features)->map(function ($feature) use ($translations) {
                return $translations["features.{$feature}"] ?? $feature;
            })->toArray()
        ];
    }

    public function getLocalizedRoute(string $name, array $parameters = []): string
    {
        $locale = $this->getCurrentLocale();
        if ($locale === config('app.fallback_locale')) {
            return route($name, $parameters);
        }

        return route($name, array_merge(['locale' => $locale], $parameters));
    }
} 