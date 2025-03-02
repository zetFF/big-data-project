<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run()
    {
        Category::firstOrCreate(
            ['slug' => 'food'],
            [
                'name' => 'Food',
                'description' => 'Food category'
            ]
        );
    }
} 