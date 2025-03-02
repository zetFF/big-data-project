import React from "react";
import { Link } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";
import { formatCurrency } from "@/utils";

export default function Wishlist({
    items,
    totalValue,
    priceDrops,
    outOfStock,
}) {
    const { delete: destroy, post } = useForm();

    const handleRemove = (productId) => {
        destroy(route("wishlist.remove", productId));
    };

    const handleMoveToCart = (productId) => {
        post(route("wishlist.moveToCart", productId));
    };

    const handleShare = (medium) => {
        post(route("wishlist.share", { medium }));
    };

    return (
        <div className="space-y-8">
            {/* Wishlist Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Total Value
                    </h3>
                    <p className="text-3xl font-bold text-green-600">
                        {formatCurrency(totalValue)}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Price Drops
                    </h3>
                    <p className="text-3xl font-bold text-blue-600">
                        {priceDrops}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Out of Stock
                    </h3>
                    <p className="text-3xl font-bold text-red-600">
                        {outOfStock}
                    </p>
                </div>
            </div>

            {/* Wishlist Items */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">My Wishlist</h2>
                        <div className="space-x-2">
                            <button
                                onClick={() => handleShare("email")}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                Share via Email
                            </button>
                            <button
                                onClick={() => handleShare("whatsapp")}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                Share via WhatsApp
                            </button>
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-gray-200">
                    {items.map((item) => (
                        <div key={item.id} className="p-6 flex items-center">
                            <div className="flex-shrink-0 w-24 h-24">
                                <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                    className="w-full h-full object-cover rounded"
                                />
                            </div>
                            <div className="ml-6 flex-1">
                                <h3 className="text-lg font-medium">
                                    <Link
                                        href={route(
                                            "products.show",
                                            item.product.id
                                        )}
                                    >
                                        {item.product.name}
                                    </Link>
                                </h3>
                                <div className="mt-1 flex items-center">
                                    <span className="text-lg font-bold">
                                        {formatCurrency(item.product.price)}
                                    </span>
                                    {item.product.price < item.added_price && (
                                        <span className="ml-2 text-sm text-green-600">
                                            Price dropped from{" "}
                                            {formatCurrency(item.added_price)}
                                        </span>
                                    )}
                                </div>
                                {item.product.stock === 0 ? (
                                    <p className="mt-1 text-red-600">
                                        Out of stock
                                    </p>
                                ) : (
                                    <p className="mt-1 text-green-600">
                                        In stock
                                    </p>
                                )}
                            </div>
                            <div className="ml-6 flex space-x-3">
                                <button
                                    onClick={() =>
                                        handleMoveToCart(item.product.id)
                                    }
                                    disabled={item.product.stock === 0}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    Add to Cart
                                </button>
                                <button
                                    onClick={() =>
                                        handleRemove(item.product.id)
                                    }
                                    className="text-red-600 hover:text-red-900"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
