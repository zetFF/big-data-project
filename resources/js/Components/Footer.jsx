import React from "react";
import { Link } from "@inertiajs/react";

export default function Footer() {
    return (
        <footer className="bg-white border-t mt-12">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                            About Us
                        </h3>
                        <ul className="mt-4 space-y-4">
                            <li>
                                <Link
                                    href="/about"
                                    className="text-base text-gray-500 hover:text-gray-900"
                                >
                                    Company
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="text-base text-gray-500 hover:text-gray-900"
                                >
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                            Customer Service
                        </h3>
                        <ul className="mt-4 space-y-4">
                            <li>
                                <Link
                                    href="/faq"
                                    className="text-base text-gray-500 hover:text-gray-900"
                                >
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/shipping"
                                    className="text-base text-gray-500 hover:text-gray-900"
                                >
                                    Shipping
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                            Legal
                        </h3>
                        <ul className="mt-4 space-y-4">
                            <li>
                                <Link
                                    href="/privacy"
                                    className="text-base text-gray-500 hover:text-gray-900"
                                >
                                    Privacy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/terms"
                                    className="text-base text-gray-500 hover:text-gray-900"
                                >
                                    Terms
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                            Newsletter
                        </h3>
                        <p className="mt-4 text-base text-gray-500">
                            Subscribe to our newsletter for updates and
                            exclusive offers.
                        </p>
                        <form className="mt-4">
                            <input
                                type="email"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter your email"
                            />
                        </form>
                    </div>
                </div>

                <div className="mt-8 border-t border-gray-200 pt-8">
                    <p className="text-base text-gray-400 text-center">
                        © 2024 FoodShop. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
