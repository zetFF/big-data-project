import React from "react";
import { Link } from "@inertiajs/react";
import { formatCurrency } from "@/utils";

export default function ProductComparison({ products, comparisonData }) {
    const {
        specifications,
        features,
        price_comparison,
        rating_comparison,
        stock_status,
        shipping_info,
    } = comparisonData;

    return (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
            {/* Product Headers */}
            <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(200px,1fr))] gap-4 p-6 border-b">
                <div className="font-semibold">Product</div>
                {products.map((product) => (
                    <div key={product.id} className="text-center">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-32 h-32 mx-auto object-cover rounded-lg"
                        />
                        <h3 className="mt-2 font-medium">
                            <Link href={route("products.show", product.id)}>
                                {product.name}
                            </Link>
                        </h3>
                    </div>
                ))}
            </div>

            {/* Price Comparison */}
            <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(200px,1fr))] gap-4 p-6 border-b">
                <div className="font-semibold">Price</div>
                {products.map((product) => (
                    <div key={product.id} className="text-center">
                        <div className="text-xl font-bold text-green-600">
                            {formatCurrency(
                                price_comparison.current_prices[product.id]
                            )}
                        </div>
                        {price_comparison.discounts[product.id].amount > 0 && (
                            <div className="text-sm text-gray-500">
                                Save{" "}
                                {formatCurrency(
                                    price_comparison.discounts[product.id]
                                        .amount
                                )}
                                (
                                {price_comparison.discounts[
                                    product.id
                                ].percentage.toFixed(0)}
                                %)
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Specifications */}
            {Object.entries(specifications).map(([spec, values]) => (
                <div
                    key={spec}
                    className="grid grid-cols-[200px_repeat(auto-fit,minmax(200px,1fr))] gap-4 p-6 border-b"
                >
                    <div className="font-semibold">{spec}</div>
                    {products.map((product) => (
                        <div key={product.id} className="text-center">
                            {values[product.id]}
                        </div>
                    ))}
                </div>
            ))}

            {/* Features */}
            {Object.entries(features).map(([feature, values]) => (
                <div
                    key={feature}
                    className="grid grid-cols-[200px_repeat(auto-fit,minmax(200px,1fr))] gap-4 p-6 border-b"
                >
                    <div className="font-semibold">{feature}</div>
                    {products.map((product) => (
                        <div key={product.id} className="text-center">
                            {values[product.id] ? (
                                <span className="text-green-600">✓</span>
                            ) : (
                                <span className="text-red-600">✗</span>
                            )}
                        </div>
                    ))}
                </div>
            ))}

            {/* Ratings */}
            <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(200px,1fr))] gap-4 p-6 border-b">
                <div className="font-semibold">Customer Rating</div>
                {products.map((product) => (
                    <div key={product.id} className="text-center">
                        <div className="text-lg font-bold">
                            {rating_comparison[
                                product.id
                            ].average_rating.toFixed(1)}{" "}
                            / 5
                        </div>
                        <div className="text-sm text-gray-500">
                            Based on{" "}
                            {rating_comparison[product.id].total_reviews}{" "}
                            reviews
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
