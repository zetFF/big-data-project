import React from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";

export default function AnalyticsDashboard({ metrics, customerAnalytics }) {
    const salesData = {
        labels: ["Today", "This Month"],
        datasets: [
            {
                label: "Sales",
                data: [metrics.sales.today, metrics.sales.this_month],
                backgroundColor: "rgba(59, 130, 246, 0.5)",
                borderColor: "rgb(59, 130, 246)",
            },
        ],
    };

    const ordersData = {
        labels: ["Pending", "Processing", "Completed"],
        datasets: [
            {
                data: [
                    metrics.orders.pending,
                    metrics.orders.processing,
                    metrics.orders.completed,
                ],
                backgroundColor: [
                    "rgba(251, 191, 36, 0.5)",
                    "rgba(59, 130, 246, 0.5)",
                    "rgba(34, 197, 94, 0.5)",
                ],
            },
        ],
    };

    return (
        <div className="space-y-6">
            {/* Sales Overview */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Sales Overview</h2>
                <Line data={salesData} />
            </div>

            {/* Order Status */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Order Status</h2>
                <div className="w-64 mx-auto">
                    <Doughnut data={ordersData} />
                </div>
            </div>

            {/* Customer Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">
                        Customer Retention
                    </h3>
                    <p className="text-3xl font-bold text-blue-600">
                        {customerAnalytics.customer_retention.toFixed(1)}%
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">
                        Average Order Value
                    </h3>
                    <p className="text-3xl font-bold text-green-600">
                        ${customerAnalytics.average_order_value.toFixed(2)}
                    </p>
                </div>
            </div>
        </div>
    );
}
