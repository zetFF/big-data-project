<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\VendorProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class VendorRegisterController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'shop_name' => 'required|string|max:255',
            'address' => 'required|string',
            'city' => 'required|string',
            'postal_code' => 'required|string',
            'phone' => 'required|string',
        ]);

        return DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'vendor',
                'phone' => $request->phone,
            ]);

            $user->vendorProfile()->create([
                'shop_name' => $request->shop_name,
                'address' => $request->address,
                'city' => $request->city,
                'postal_code' => $request->postal_code,
            ]);

            return redirect()->route('vendor.dashboard');
        });
    }
} 