import React from "react";
import { Head } from "@inertiajs/react";
import Layout from "@/Layouts/Layout";

export default function Compare({ products, specifications }) {
    return (
        <Layout>
            <Head title="Compare Products" />

            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold mb-8">Product Comparison</h1>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Feature
                                </th>
                                {products.map((product) => (
                                    <th
                                        key={product.id}
                                        className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        {product.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    Image
                                </td>
                                {products.map((product) => (
                                    <td
                                        key={product.id}
                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                    >
                                        <img
                                            src={product.primary_image}
                                            alt={product.name}
                                            className="w-24 h-24 object-cover rounded"
                                        />
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    Price
                                </td>
                                {products.map((product) => (
                                    <td
                                        key={product.id}
                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                    >
                                        ${product.price}
                                    </td>
                                ))}
                            </tr>
                            {specifications.map((spec) => (
                                <tr key={spec}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {spec}
                                    </td>
                                    {products.map((product) => (
                                        <td
                                            key={product.id}
                                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                        >
                                            {product.specifications.find(
                                                (s) => s.name === spec
                                            )?.value || "-"}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
}
