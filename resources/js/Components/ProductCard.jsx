import React from "react";
import { Link } from "@inertiajs/react";

export default function ProductCard({ product }) {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
                src={product.primary_image}
                alt={product.name}
                className="w-full h-48 object-cover"
            />

            <div className="p-4">
                <h3 className="text-lg font-semibold">
                    <Link href={route("products.show", product.slug)}>
                        {product.name}
                    </Link>
                </h3>

                <p className="text-gray-600 mt-2 text-sm line-clamp-2">
                    {product.description}
                </p>

                <div className="mt-4 flex items-center justify-between">
                    <span className="text-xl font-bold">${product.price}</span>

                    <button
                        onClick={() => addToCart(product)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}
