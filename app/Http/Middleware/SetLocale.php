<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\LanguageService;

class SetLocale
{
    public function __construct(
        protected LanguageService $languageService
    ) {}

    public function handle(Request $request, Closure $next)
    {
        $locale = session('locale', config('app.locale'));
        $this->languageService->setLocale($locale);

        return $next($request);
    }
} 