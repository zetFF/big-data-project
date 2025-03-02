import React from "react";
import { Link } from "@inertiajs/react";

export default function Navigation() {
    return (
        <nav className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link href="/" className="flex items-center">
                            <span className="text-xl font-bold text-indigo-600">
                                FoodShop
                            </span>
                        </Link>

                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                href="/products"
                                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-indigo-600"
                            >
                                Products
                            </Link>
                            <Link
                                href="/categories"
                                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-indigo-600"
                            >
                                Categories
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <Link
                            href="/cart"
                            className="p-2 text-gray-900 hover:text-indigo-600"
                        >
                            Cart
                        </Link>
                        <Link
                            href="/account"
                            className="ml-4 p-2 text-gray-900 hover:text-indigo-600"
                        >
                            Account
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
