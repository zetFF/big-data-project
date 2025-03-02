<?php
Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    Route::post('/bulk-orders', [BulkOrderController::class, 'store']);
    Route::post('/returns', [ReturnController::class, 'store']);
}); 