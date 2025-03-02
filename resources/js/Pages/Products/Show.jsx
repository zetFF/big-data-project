import React from "react";
import { Head } from "@inertiajs/react";
import Layout from "@/Layouts/Layout";
import Recommendations from "@/Components/Products/Recommendations";

export default function Show({
    product,
    similarProducts,
    frequentlyBoughtTogether,
    metaTags,
}) {
    return (
        <Layout>
            <Head>
                {Object.entries(metaTags).map(([name, content]) => (
                    <meta key={name} name={name} content={content} />
                ))}
                <script type="application/ld+json">
                    {JSON.stringify(product.schema)}
                </script>
            </Head>

            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {/* Product details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Product images */}
                    <div className="space-y-4">
                        <img
                            src={product.primary_image}
                            alt={product.name}
                            className="w-full rounded-lg"
                        />
                        <div className="grid grid-cols-4 gap-4">
                            {product.images.map((image) => (
                                <img
                                    key={image.id}
                                    src={image.url}
                                    alt={product.name}
                                    className="w-full rounded-lg cursor-pointer"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Product info */}
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold">{product.name}</h1>
                        <p className="text-gray-600">{product.description}</p>
                        <div className="text-2xl font-bold">
                            ${product.price}
                        </div>
                        {/* Add to cart button */}
                    </div>
                </div>

                {/* Recommendations */}
                <Recommendations
                    title="Similar Products"
                    products={similarProducts}
                />

                <Recommendations
                    title="Frequently Bought Together"
                    products={frequentlyBoughtTogether}
                />
            </div>
        </Layout>
    );
}
