<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

class PerformanceMonitoringService
{
    public function trackPageLoad($route, $loadTime): void
    {
        $key = "page_load:{$route}:" . now()->format('Y-m-d');
        
        Redis::pipeline(function ($pipe) use ($key, $loadTime) {
            $pipe->lpush($key, $loadTime);
            $pipe->ltrim($key, 0, 999); // Keep last 1000 measurements
            $pipe->expire($key, 86400); // Expire after 24 hours
        });
    }

    public function getDatabaseMetrics(): array
    {
        return [
            'slow_queries' => $this->getSlowQueries(),
            'query_count' => DB::getQueryLog(),
            'average_response' => $this->calculateAverageQueryTime()
        ];
    }

    public function getCacheMetrics(): array
    {
        return [
            'hit_rate' => Cache::get('cache_hit_rate', 0),
            'miss_rate' => Cache::get('cache_miss_rate', 0),
            'size' => $this->getCacheSize()
        ];
    }

    public function getSystemMetrics(): array
    {
        return [
            'cpu_usage' => sys_getloadavg()[0],
            'memory_usage' => memory_get_usage(true),
            'disk_usage' => disk_free_space('/')
        ];
    }

    private function getSlowQueries(): array
    {
        return DB::select("
            SELECT * FROM mysql.slow_log 
            WHERE start_time > DATE_SUB(NOW(), INTERVAL 24 HOUR)
            ORDER BY query_time DESC 
            LIMIT 10
        ");
    }

    private function calculateAverageQueryTime(): float
    {
        $queries = DB::getQueryLog();
        if (empty($queries)) return 0;

        $totalTime = array_sum(array_column($queries, 'time'));
        return $totalTime / count($queries);
    }

    private function getCacheSize(): int
    {
        if (config('cache.default') === 'redis') {
            return Redis::info()['used_memory'];
        }
        return 0;
    }

    public function logPerformanceIssue($type, $details): void
    {
        Log::channel('performance')->warning("Performance Issue: {$type}", $details);
    }
} 