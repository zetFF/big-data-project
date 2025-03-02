<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\PerformanceMonitoringService;

class TrackPerformance
{
    protected $performanceService;

    public function __construct(PerformanceMonitoringService $performanceService)
    {
        $this->performanceService = $performanceService;
    }

    public function handle(Request $request, Closure $next)
    {
        $startTime = microtime(true);
        
        $response = $next($request);
        
        $endTime = microtime(true);
        $loadTime = ($endTime - $startTime) * 1000; // Convert to milliseconds

        if ($loadTime > 1000) { // If load time > 1 second
            $this->performanceService->logPerformanceIssue('slow_page_load', [
                'route' => $request->route()->getName(),
                'load_time' => $loadTime,
                'user_agent' => $request->userAgent()
            ]);
        }

        $this->performanceService->trackPageLoad(
            $request->route()->getName(),
            $loadTime
        );

        return $response;
    }
} 