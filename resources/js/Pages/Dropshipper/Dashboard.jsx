import React from "react";
import { Head } from "@inertiajs/react";
import Layout from "@/Layouts/Layout";

export default function Dashboard({ profile, statistics, recentOrders }) {
    return (
        <Layout>
            <Head title="Dropshipper Dashboard" />

            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Total Orders
                        </h3>
                        <p className="text-3xl font-bold text-indigo-600">
                            {statistics.total_orders}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Total Revenue
                        </h3>
                        <p className="text-3xl font-bold text-green-600">
                            ${statistics.total_revenue.toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Pending Orders
                        </h3>
                        <p className="text-3xl font-bold text-yellow-600">
                            {statistics.pending_orders}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Monthly Revenue
                        </h3>
                        <p className="text-3xl font-bold text-blue-600">
                            ${statistics.monthly_revenue.toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Recent Orders
                        </h3>
                    </div>
                    <div className="divide-y">
                        {recentOrders.map((order) => (
                            <div key={order.id} className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">
                                            Order #{order.id}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {order.customer_name} -{" "}
                                            {order.customer_email}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">
                                            ${order.total_amount}
                                        </p>
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                order.status === "completed"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                            }`}
                                        >
                                            {order.status}
                                        </span>
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
