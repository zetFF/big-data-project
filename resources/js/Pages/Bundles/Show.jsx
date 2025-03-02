import React from "react";
import { Head } from "@inertiajs/react";
import Layout from "@/Layouts/Layout";
import BundleTimer from "@/Components/BundleTimer";
import ProductCard from "@/Components/ProductCard";

export default function Show({ bundle, similarBundles }) {
    return (
        <Layout>
            <Head title={bundle.name} />

            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                        <h1 className="text-3xl font-bold">{bundle.name}</h1>
                        <p className="mt-2">{bundle.description}</p>
                        <div className="mt-4 flex items-center space-x-4">
                            <div className="text-2xl font-bold">
                                ${bundle.discounted_price}
                            </div>
                            <div className="text-lg text-gray-300 line-through">
                                ${bundle.original_price}
                            </div>
                            <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-sm font-semibold">
                                Save {bundle.discount_percentage}%
                            </div>
                        </div>
                        <BundleTimer endDate={bundle.end_date} />
                    </div>

                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            Bundle Items
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bundle.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="border rounded-lg p-4"
                                >
                                    <img
                                        src={item.product.primary_image}
                                        alt={item.product.name}
                                        className="w-full h-48 object-cover rounded"
                                    />
                                    <div className="mt-4">
                                        <h3 className="font-semibold">
                                            {item.product.name}
                                        </h3>
                                        <p className="text-gray-600 text-sm mt-1">
                                            Quantity: {item.quantity}
                                        </p>
                                        <p className="text-gray-600 text-sm">
                                            Individual price: $
                                            {item.product.price}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={() =>
                                    (window.location = route(
                                        "bundles.add-to-cart",
                                        bundle.id
                                    ))
                                }
                                className="bg-indigo-600 text-white px-8 py-3 rounded-full hover:bg-indigo-700 font-semibold"
                            >
                                Add Bundle to Cart
                            </button>
                        </div>
                    </div>

                    {similarBundles.length > 0 && (
                        <div className="p-6 border-t">
                            <h2 className="text-xl font-semibold mb-4">
                                Similar Bundles
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {similarBundles.map((bundle) => (
                                    <ProductCard
                                        key={bundle.id}
                                        product={bundle}
                                        isBundle
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
