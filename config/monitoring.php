<?php
return [
    'critical_paths' => [
        'checkout_process',
        'payment_gateway',
        'inventory_updates',
        'order_processing'
    ],
    'alert_thresholds' => [
        'response_time' => 2000, // ms
        'error_rate' => 1, // percentage
        'concurrent_users' => 1000
    ]
]; 