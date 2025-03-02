import React from "react";
import { Link } from "@inertiajs/react";
import ProductCard from "@/Components/ProductCard";

export default function Recommendations({ title, products }) {
    if (!products.length) return null;

    return (
        <div className="py-8">
            <h2 className="text-2xl font-bold mb-6">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        compact={true}
                    />
                ))}
            </div>
        </div>
    );
}
