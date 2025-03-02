import React from "react";
import { Link } from "@inertiajs/react";
import { formatCurrency } from "@/utils";

export default function WishlistItem({ item, onRemove }) {
    return (
        <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-4">
                <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover"
                />
                <div>
                    <Link
                        href={`/products/${item.product.id}`}
                        className="text-lg font-medium text-gray-900 hover:text-indigo-600"
                    >
                        {item.product.name}
                    </Link>
                    <p className="text-indigo-600 font-medium">
                        {formatCurrency(item.product.price)}
                    </p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => onRemove(item.id)}
                    className="text-red-600 hover:text-red-800"
                >
                    Remove
                </button>
                <Link
                    href={`/cart/add/${item.product.id}`}
                    method="post"
                    as="button"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                    Add to Cart
                </Link>
            </div>
        </div>
    );
}
