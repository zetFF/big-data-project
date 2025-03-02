import React from "react";
import { Head } from "@inertiajs/react";
import Layout from "@/Layouts/Layout";
import ProductCard from "@/Components/ProductCard";

export default function Home({ featuredProducts, newArrivals }) {
    return (
        <Layout>
            <Head title="Home" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">
                        Featured Products
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {featuredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-6">New Arrivals</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {newArrivals.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>
            </div>
        </Layout>
    );
}
