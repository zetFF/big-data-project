import React from "react";
import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Line } from "react-chartjs-2";
import StatisticCard from "@/Components/Admin/StatisticCard";
import RecentOrders from "@/Components/Admin/RecentOrders";

export default function Dashboard({ statistics, recentOrders, salesChart }) {
    const chartData = {
        labels: salesChart.map((item) => item.date),
        datasets: [
            {
                label: "Sales",
                data: salesChart.map((item) => item.total),
                fill: false,
                borderColor: "rgb(75, 192, 192)",
                tension: 0.1,
            },
        ],
    };

    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <StatisticCard
                            title="Total Sales"
                            value={`$${statistics.total_sales}`}
                            icon="dollar"
                        />
                        <StatisticCard
                            title="Total Orders"
                            value={statistics.total_orders}
                            icon="shopping-cart"
                        />
                        <StatisticCard
                            title="Total Customers"
                            value={statistics.total_customers}
                            icon="users"
                        />
                        <StatisticCard
                            title="Total Products"
                            value={statistics.total_products}
                            icon="cube"
                        />
                    </div>

                    {/* Sales Chart */}
                    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                        <h2 className="text-xl font-semibold mb-4">
                            Sales Overview
                        </h2>
                        <Line data={chartData} />
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">
                            Recent Orders
                        </h2>
                        <RecentOrders orders={recentOrders} />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
