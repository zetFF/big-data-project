<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\VendorProfile;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run()
    {
        // Jalankan seeder yang dibutuhkan
        $this->call([
            VendorProfileSeeder::class,
            CategorySeeder::class
        ]);
        
        $vendorProfile = VendorProfile::first();

        // Gunakan firstOrCreate untuk menghindari duplikasi
        Product::firstOrCreate(
            ['slug' => Str::slug('Test Product')],
            [
                'name' => 'Test Product',
                'description' => 'This is a test product',
                'price' => 100000,
                'stock' => 100,
                'category_id' => 1,
                'vendor_id' => $vendorProfile->id,
                'weight' => 1000
            ]
        );
    }
} 