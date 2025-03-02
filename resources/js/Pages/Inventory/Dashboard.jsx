import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import Layout from "@/Layouts/Layout";
import { Line } from "react-chartjs-2";

export default function Dashboard({
    products,
    stockForecasts,
    lowStockAlerts,
}) {
    const [selectedProduct, setSelectedProduct] = useState(null);

    const stockTrendData = {
        labels: products.map((p) => p.name),
        datasets: [
            {
                label: "Current Stock",
                data: products.map((p) => p.stock),
                backgroundColor: products.map((p) =>
                    p.stock <= p.low_stock_threshold
                        ? "rgba(255, 99, 132, 0.5)"
                        : "rgba(75, 192, 192, 0.5)"
                ),
            },
        ],
    };

    return (
        <Layout>
            <Head title="Inventory Dashboard" />

            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {/* Alert Section */}
                {lowStockAlerts.length > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-5 w-5 text-red-400"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Low Stock Alerts ({lowStockAlerts.length})
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <ul className="list-disc pl-5 space-y-1">
                                        {lowStockAlerts.map((alert) => (
                                            <li key={alert.id}>
                                                {alert.product.name} - Only{" "}
                                                {alert.current_stock} units
                                                remaining
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stock Overview */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-lg font-semibold mb-4">
                        Stock Overview
                    </h2>
                    <div className="h-64">
                        <Line
                            data={stockTrendData}
                            options={{ maintainAspectRatio: false }}
                        />
                    </div>
                </div>

                {/* Forecasting Section */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b">
                        <h2 className="text-lg font-semibold">
                            Stock Forecasts
                        </h2>
                    </div>
                    <div className="divide-y">
                        {stockForecasts.map((forecast) => (
                            <div key={forecast.product_id} className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium">
                                            {forecast.product_name}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Current Stock:{" "}
                                            {forecast.current_stock} units
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm">
                                            Avg. Monthly Demand:{" "}
                                            {Math.round(
                                                forecast.avg_monthly_demand
                                            )}{" "}
                                            units
                                        </p>
                                        <p
                                            className={`text-sm ${
                                                forecast.weeks_until_stockout <=
                                                4
                                                    ? "text-red-600"
                                                    : "text-green-600"
                                            }`}
                                        >
                                            {forecast.weeks_until_stockout.toFixed(
                                                1
                                            )}{" "}
                                            weeks until stockout
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
