<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\VendorProfile;
use Illuminate\Database\Seeder;

class VendorProfileSeeder extends Seeder
{
    public function run()
    {
        $vendor = User::where('role', 'vendor')->first();
        
        if (!$vendor) {
            $vendor = User::create([
                'name' => 'Vendor Test',
                'email' => 'vendor@example.com',
                'password' => bcrypt('password'),
                'role' => 'vendor'
            ]);
        }

        VendorProfile::create([
            'user_id' => $vendor->id,
            'shop_name' => 'Test Shop',
            'description' => 'Test vendor description',
            'address' => 'Test Address',
            'city' => 'Test City',
            'postal_code' => '12345',
            'status' => 'approved'
        ]);
    }
} 