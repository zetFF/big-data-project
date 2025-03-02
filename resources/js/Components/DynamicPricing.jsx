import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { formatCurrency } from "@/utils";

export default function DynamicPricing({ product, priceHistory }) {
    const [showPriceChart, setShowPriceChart] = useState(false);

    const priceData = {
        labels: priceHistory.map((h) =>
            new Date(h.created_at).toLocaleDateString()
        ),
        datasets: [
            {
                label: "Price History",
                data: priceHistory.map((h) => h.price),
                fill: false,
                borderColor: "rgb(75, 192, 192)",
                tension: 0.1,
            },
        ],
    };

    return (
        <div className="space-y-4">
            {/* Current Price Display */}
            <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold">
                    {formatCurrency(product.price)}
                </span>
                {product.base_price !== product.price && (
                    <span className="text-lg text-gray-500 line-through">
                        {formatCurrency(product.base_price)}
                    </span>
                )}
                {product.price < product.base_price && (
                    <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded">
                        Save{" "}
                        {formatCurrency(product.base_price - product.price)}
                    </span>
                )}
            </div>

            {/* Price History Toggle */}
            <button
                onClick={() => setShowPriceChart(!showPriceChart)}
                className="text-sm text-gray-600 hover:text-gray-900"
            >
                {showPriceChart ? "Hide Price History" : "Show Price History"}
            </button>

            {/* Price History Chart */}
            {showPriceChart && (
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="h-64">
                        <Line
                            data={priceData}
                            options={{
                                maintainAspectRatio: false,
                                scales: {
                                    y: {
                                        beginAtZero: false,
                                        ticks: {
                                            callback: (value) =>
                                                formatCurrency(value),
                                        },
                                    },
                                },
                            }}
                        />
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                        Lowest price in 30 days:{" "}
                        {formatCurrency(
                            Math.min(...priceHistory.map((h) => h.price))
                        )}
                    </div>
                </div>
            )}

            {/* Dynamic Pricing Indicators */}
            {product.price_factors && (
                <div className="text-sm text-gray-600">
                    <p>Price adjusted based on:</p>
                    <ul className="list-disc list-inside">
                        {product.price_factors.map((factor, index) => (
                            <li key={index}>{factor}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
