import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import Layout from "@/Layouts/Layout";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { formatCurrency } from "@/utils";

export default function Dashboard({ metrics }) {
    const [timeframe, setTimeframe] = useState("30d");

    const revenueChartData = {
        labels: metrics.revenue.chart_data.map((d) => d.date),
        datasets: [
            {
                label: "Revenue",
                data: metrics.revenue.chart_data.map((d) => d.amount),
                fill: false,
                borderColor: "rgb(75, 192, 192)",
                tension: 0.1,
            },
        ],
    };

    const conversionFunnelData = {
        labels: [
            "Visits",
            "Product Views",
            "Add to Cart",
            "Checkout",
            "Purchase",
        ],
        datasets: [
            {
                data: [
                    metrics.conversion.funnel.visits,
                    metrics.conversion.funnel.product_views,
                    metrics.conversion.funnel.add_to_cart,
                    metrics.conversion.funnel.checkouts,
                    metrics.conversion.funnel.purchases,
                ],
                backgroundColor: [
                    "#4CAF50",
                    "#2196F3",
                    "#FFC107",
                    "#FF9800",
                    "#F44336",
                ],
            },
        ],
    };

    return (
        <Layout>
            <Head title="Analytics Dashboard" />

            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {/* Time Frame Selector */}
                <div className="mb-8">
                    <select
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                    </select>
                </div>

                {/* Revenue Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Daily Revenue
                        </h3>
                        <p className="text-3xl font-bold text-green-600">
                            {formatCurrency(metrics.revenue.daily)}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Monthly Revenue
                        </h3>
                        <p className="text-3xl font-bold text-blue-600">
                            {formatCurrency(metrics.revenue.monthly)}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Growth
                        </h3>
                        <p className="text-3xl font-bold text-purple-600">
                            {metrics.revenue.growth}%
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Conversion Rate
                        </h3>
                        <p className="text-3xl font-bold text-indigo-600">
                            {metrics.conversion.rate.toFixed(2)}%
                        </p>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">
                            Revenue Trend
                        </h3>
                        <Line
                            data={revenueChartData}
                            options={{ maintainAspectRatio: false }}
                        />
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">
                            Sales Funnel
                        </h3>
                        <Bar
                            data={conversionFunnelData}
                            options={{ maintainAspectRatio: false }}
                        />
                    </div>
                </div>

                {/* Top Products Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b">
                        <h3 className="text-lg font-semibold">
                            Top Selling Products
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Units Sold
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Revenue
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {metrics.products.top_sellers.map((product) => (
                                    <tr key={product.product_id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {product.product.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {product.total_quantity}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {formatCurrency(
                                                product.total_revenue
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
