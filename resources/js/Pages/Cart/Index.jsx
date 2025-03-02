import React from "react";
import { Head, useForm } from "@inertiajs/react";
import Layout from "@/Layouts/Layout";

export default function Cart({ cart }) {
    const { delete: destroy } = useForm();

    const removeItem = (itemId) => {
        destroy(route("cart.remove", itemId), {
            preserveScroll: true,
        });
    };

    const calculateTotal = () => {
        return cart.items.reduce((total, item) => {
            return total + item.product.price * item.quantity;
        }, 0);
    };

    return (
        <Layout>
            <Head title="Shopping Cart" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {cart.items.length > 0 ? (
                                <>
                                    {cart.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between border-b py-4"
                                        >
                                            <div className="flex items-center">
                                                <img
                                                    src={
                                                        item.product
                                                            .primary_image
                                                    }
                                                    alt={item.product.name}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                                <div className="ml-4">
                                                    <h3 className="text-lg font-semibold">
                                                        {item.product.name}
                                                    </h3>
                                                    <p className="text-gray-600">
                                                        ${item.product.price} x{" "}
                                                        {item.quantity}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() =>
                                                    removeItem(item.id)
                                                }
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}

                                    <div className="mt-6 flex justify-between items-center">
                                        <div className="text-xl font-bold">
                                            Total: ${calculateTotal()}
                                        </div>

                                        <Link
                                            href={route("checkout")}
                                            className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600"
                                        >
                                            Proceed to Checkout
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">
                                        Your cart is empty
                                    </p>
                                    <Link
                                        href={route("products.index")}
                                        className="text-blue-500 hover:text-blue-700 mt-2 inline-block"
                                    >
                                        Continue Shopping
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
