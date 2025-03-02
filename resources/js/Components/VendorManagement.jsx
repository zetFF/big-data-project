import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import { Radar } from "react-chartjs-2";
import { formatCurrency, formatDate } from "@/utils";

export default function VendorManagement({
    vendor,
    performance,
    contracts,
    purchaseOrders,
}) {
    const [activeTab, setActiveTab] = useState("overview");

    const performanceData = {
        labels: [
            "Delivery Performance",
            "Quality Metrics",
            "Price Competitiveness",
            "Response Time",
            "Payment History",
        ],
        datasets: [
            {
                label: "Vendor Performance",
                data: [
                    performance.delivery_performance.on_time_delivery_rate,
                    100 - performance.quality_metrics.defect_rate,
                    performance.price_competitiveness
                        .price_competitiveness_score,
                    100 -
                        (performance.response_time.average_response_time / 24) *
                            100,
                    100 -
                        (performance.payment_history.average_payment_delay /
                            30) *
                            100,
                ],
                fill: true,
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgb(75, 192, 192)",
                pointBackgroundColor: "rgb(75, 192, 192)",
                pointBorderColor: "#fff",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: "rgb(75, 192, 192)",
            },
        ],
    };

    return (
        <div className="space-y-6">
            {/* Vendor Overview */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {vendor.name}
                            </h2>
                            <p className="text-sm text-gray-500">
                                Vendor ID: {vendor.id}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">
                                Overall Score
                            </p>
                            <p className="text-3xl font-bold text-indigo-600">
                                {performance.overall_score}/100
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 grid grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-gray-500">
                                Contact Person
                            </p>
                            <p className="font-medium">{vendor.contact_name}</p>
                            <p className="text-sm text-gray-500">
                                {vendor.email}
                            </p>
                            <p className="text-sm text-gray-500">
                                {vendor.phone}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">
                                Payment Terms
                            </p>
                            <p className="font-medium">
                                {vendor.payment_terms}
                            </p>
                            <p className="text-sm text-gray-500">
                                Lead Time: {vendor.lead_time} days
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">
                                Active Since
                            </p>
                            <p className="font-medium">
                                {formatDate(vendor.created_at)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {["overview", "performance", "contracts", "orders"].map(
                        (tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`
                                py-4 px-1 border-b-2 font-medium text-sm
                                ${
                                    activeTab === tab
                                        ? "border-indigo-600 text-indigo-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }
                            `}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        )
                    )}
                </nav>
            </div>

            {/* Content */}
            {activeTab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Performance Overview
                        </h3>
                        <div className="h-64">
                            <Radar data={performanceData} />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Recent Activity
                        </h3>
                        <div className="space-y-4">
                            {vendor.recent_activities.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex items-center"
                                >
                                    <div className="flex-shrink-0">
                                        <span
                                            className={`
                                            px-2 py-1 text-xs rounded-full
                                            ${
                                                activity.type === "order"
                                                    ? "bg-green-100 text-green-800"
                                                    : activity.type === "issue"
                                                    ? "bg-red-100 text-red-800"
                                                    : "bg-blue-100 text-blue-800"
                                            }
                                        `}
                                        >
                                            {activity.type}
                                        </span>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">
                                            {activity.description}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatDate(activity.date)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "performance" && (
                <div className="space-y-6">
                    {/* Performance metrics sections */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Delivery Performance
                        </h3>
                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <p className="text-sm text-gray-500">
                                    On-Time Delivery Rate
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                    {
                                        performance.delivery_performance
                                            .on_time_delivery_rate
                                    }
                                    %
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">
                                    Average Delay
                                </p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {
                                        performance.delivery_performance
                                            .average_delay
                                    }{" "}
                                    days
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">
                                    Order Fill Rate
                                </p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {
                                        performance.delivery_performance
                                            .order_fill_rate
                                    }
                                    %
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Add more performance metric sections here */}
                </div>
            )}

            {activeTab === "contracts" && (
                <div className="space-y-6">
                    {contracts.map((contract) => (
                        <div
                            key={contract.id}
                            className="bg-white rounded-lg shadow p-6"
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Contract #{contract.id}
                                </h3>
                                <span
                                    className={`
                                    px-2 py-1 text-xs rounded-full
                                    ${
                                        contract.is_active
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                    }
                                `}
                                >
                                    {contract.is_active ? "Active" : "Inactive"}
                                </span>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm text-gray-500">
                                    Valid: {formatDate(contract.start_date)} -{" "}
                                    {formatDate(contract.end_date)}
                                </p>
                                {/* Add more contract details here */}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === "orders" && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order #
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {purchaseOrders.map((order) => (
                                <tr key={order.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {order.order_number}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {formatDate(order.created_at)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {formatCurrency(order.total_amount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`
                                            px-2 py-1 text-xs rounded-full
                                            ${
                                                order.status === "completed"
                                                    ? "bg-green-100 text-green-800"
                                                    : order.status === "pending"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-gray-100 text-gray-800"
                                            }
                                        `}
                                        >
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
