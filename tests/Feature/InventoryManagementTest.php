<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Product;
use App\Models\User;
use App\Services\InventoryManagementService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class InventoryManagementTest extends TestCase
{
    use RefreshDatabase;

    private $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new InventoryManagementService();
    }

    public function test_can_adjust_stock()
    {
        $product = Product::factory()->create(['stock' => 100]);
        
        $this->service->adjustStock($product, -5, 'sale');
        
        $this->assertEquals(95, $product->fresh()->stock);
    }

    public function test_prevents_negative_stock()
    {
        $product = Product::factory()->create(['stock' => 10]);
        
        $this->expectException(\Exception::class);
        
        $this->service->adjustStock($product, -20, 'sale');
    }
} 