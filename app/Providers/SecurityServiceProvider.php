<?php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class SecurityServiceProvider extends ServiceProvider
{
    public function boot()
    {
        // XSS Protection
        header('X-XSS-Protection: 1; mode=block');
        
        // SQL Injection Prevention
        config(['database.default' => 'mysql_secure']);
        
        // CSRF Protection
        config(['session.secure' => true]);
        
        // Rate Limiting
        $this->app['router']->middleware(['throttle:60,1']);
    }
} 