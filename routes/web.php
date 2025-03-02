<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\Auth\VendorRegisterController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\VendorDashboardController;
use App\Http\Controllers\AdminDashboardController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Public routes
Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');


// Vendor registration
Route::get('/vendor/register', [VendorRegisterController::class, 'showRegistrationForm'])
    ->name('vendor.register');
Route::post('/vendor/register', [VendorRegisterController::class, 'register']);

// Protected routes
Route::middleware(['auth'])->group(function () {
    // Cart routes
    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('/cart/products/{product}', [CartController::class, 'addItem'])->name('cart.add');
    Route::patch('/cart/items/{cartItem}', [CartController::class, 'updateItem'])->name('cart.update');
    Route::delete('/cart/items/{cartItem}', [CartController::class, 'removeItem'])->name('cart.remove');

    // Customer routes
    Route::middleware(['role:customer'])->group(function () {
        Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
        Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
        Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    });

    // Vendor routes
    Route::middleware(['role:vendor'])->prefix('vendor')->group(function () {
        Route::get('/dashboard', [VendorDashboardController::class, 'index'])->name('vendor.dashboard');
    });

    // Admin routes
    Route::middleware(['role:admin'])->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
    });
});

require __DIR__.'/auth.php';
