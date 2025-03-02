import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import Layout from "@/Layouts/Layout";
import { useForm } from "@inertiajs/react";

export default function Create({ product, depositPercentage }) {
    const [totalAmount, setTotalAmount] = useState(0);
    const [depositAmount, setDepositAmount] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        quantity: 1,
        payment_method: "card",
    });

    useEffect(() => {
        const total = product.price * data.quantity;
        setTotalAmount(total);
        setDepositAmount(total * (depositPercentage / 100));
    }, [data.quantity]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("pre-orders.store", product.id));
    };

    return (
        <Layout>
            <Head title={`Pre-order ${product.name}`} />

            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">
                            {product.name}
                        </h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <img
                                    src={product.primary_image}
                                    alt={product.name}
                                    className="w-full rounded-lg"
                                />
                            </div>

                            <div>
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Quantity
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={data.quantity}
                                            onChange={(e) =>
                                                setData(
                                                    "quantity",
                                                    e.target.value
                                                )
                                            }
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Payment Method
                                        </label>
                                        <select
                                            value={data.payment_method}
                                            onChange={(e) =>
                                                setData(
                                                    "payment_method",
                                                    e.target.value
                                                )
                                            }
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="card">
                                                Credit Card
                                            </option>
                                            <option value="bank_transfer">
                                                Bank Transfer
                                            </option>
                                        </select>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex justify-between mb-2">
                                            <span>Total Amount:</span>
                                            <span className="font-bold">
                                                ${totalAmount.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <span>
                                                Required Deposit (
                                                {depositPercentage}%):
                                            </span>
                                            <span className="font-bold">
                                                ${depositAmount.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>Remaining Balance:</span>
                                            <span>
                                                $
                                                {(
                                                    totalAmount - depositAmount
                                                ).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        Place Pre-order
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
