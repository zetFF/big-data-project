<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;

class Handler extends ExceptionHandler
{
    public function register(): void
    {
        $this->reportable(function (InsufficientStockException $e) {
            // Log ke monitoring service
        });

        $this->renderable(function (InsufficientStockException $e) {
            return response()->json([
                'message' => 'Insufficient stock available',
                'error' => $e->getMessage()
            ], 400);
        });
    }
} 