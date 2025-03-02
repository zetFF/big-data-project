import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import Layout from "@/Layouts/Layout";
import CountdownTimer from "@/Components/CountdownTimer";

export default function Show({ flashSale }) {
    const [timeRemaining, setTimeRemaining] = useState(
        calculateTimeRemaining()
    );

    function calculateTimeRemaining() {
        const now = new Date().getTime();
        const end = new Date(flashSale.end_time).getTime();
        return Math.max(0, end - now);
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(calculateTimeRemaining());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <Layout>
            <Head title={flashSale.name} />

            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6 bg-red-600 text-white">
                        <h1 className="text-3xl font-bold">{flashSale.name}</h1>
                        <p className="mt-2">{flashSale.description}</p>
                        <div className="mt-4">
                            <CountdownTimer milliseconds={timeRemaining} />
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {flashSale.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="border rounded-lg overflow-hidden"
                                >
                                    <img
                                        src={item.product.primary_image}
                                        alt={item.product.name}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold">
                                            {item.product.name}
                                        </h3>
                                        <div className="mt-2 flex items-baseline space-x-2">
                                            <span className="text-2xl font-bold text-red-600">
                                                ${item.flash_sale_price}
                                            </span>
                                            <span className="text-sm text-gray-500 line-through">
                                                ${item.product.price}
                                            </span>
                                        </div>
                                        <div className="mt-2">
                                            <div className="bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-red-600 h-2"
                                                    style={{
                                                        width: `${
                                                            (item.sold /
                                                                item.stock) *
                                                            100
                                                        }%`,
                                                    }}
                                                />
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {item.stock - item.sold} items
                                                left
                                            </p>
                                        </div>
                                        <button
                                            onClick={() =>
                                                (window.location = route(
                                                    "flash-sale.purchase",
                                                    item.id
                                                ))
                                            }
                                            disabled={item.sold >= item.stock}
                                            className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
                                        >
                                            {item.sold >= item.stock
                                                ? "Sold Out"
                                                : "Buy Now"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
