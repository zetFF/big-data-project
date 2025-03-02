import React from "react";
import { Link } from "@inertiajs/react";
import ProductCard from "@/Components/ProductCard";

export default function ProductRecommendations({
    personalizedProducts,
    similarProducts,
    frequentlyBoughtTogether,
    trendingProducts,
}) {
    return (
        <div className="space-y-12">
            {/* Personalized Recommendations */}
            <section>
                <h2 className="text-2xl font-bold mb-6">Recommended for You</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {personalizedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>

            {/* Similar Products */}
            <section>
                <h2 className="text-2xl font-bold mb-6">Similar Products</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {similarProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>

            {/* Frequently Bought Together */}
            <section>
                <h2 className="text-2xl font-bold mb-6">
                    Frequently Bought Together
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {frequentlyBoughtTogether.map((product) => (
                        <div key={product.id} className="relative">
                            <ProductCard product={product} />
                            <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                Bought {product.frequency}x together
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Trending Products */}
            <section>
                <h2 className="text-2xl font-bold mb-6">Trending Now</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {trendingProducts.map((product) => (
                        <div key={product.id} className="relative">
                            <ProductCard product={product} />
                            <div className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                Trending
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
