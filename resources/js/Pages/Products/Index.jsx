import React from "react";
import { Head } from "@inertiajs/react";
import Layout from "@/Layouts/Layout";
import ProductCard from "@/Components/ProductCard";
import Pagination from "@/Components/Pagination";

export default function Index({ products }) {
    return (
        <Layout>
            <Head title="Products" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.data.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    <div className="mt-6">
                        <Pagination links={products.links} />
                    </div>
                </div>
            </div>
        </Layout>
    );
}
