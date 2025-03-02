import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import Layout from "@/Layouts/Layout";
import { Line, Bar, Pie } from "react-chartjs-2";
import DatePicker from "react-datepicker";

export default function Dashboard({ initialData }) {
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;

    const salesData = {
        labels: initialData.daily_sales.map((sale) => sale.date),
        datasets: [
            {
                label: "Daily Revenue",
                data: initialData.daily_sales.map((sale) => sale.revenue),
                fill: false,
                borderColor: "rgb(75, 192, 192)",
                tension: 0.1,
            },
            {
                label: "Order Count",
                data: initialData.daily_sales.map((sale) => sale.orders),
                fill: false,
                borderColor: "rgb(255, 99, 132)",
                tension: 0.1,
            },
        ],
    };

    const topProductsData = {
        labels: initialData.top_products.map((product) => product.name),
        datasets: [
            {
                data: initialData.top_products.map(
                    (product) => product.total_revenue
                ),
                backgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#4BC0C0",
                    "#9966FF",
                ],
            },
        ],
    };

    return (
        <Layout>
            <Head title="Sales Reports" />

            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {/* Date Range Picker */}
                <div className="mb-8">
                    <DatePicker
                        selectsRange={true}
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(update) => setDateRange(update)}
                        className="rounded-md border-gray-300"
                        placeholderText="Select date range"
                    />
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Total Sales
                        </h3>
                        <p className="text-3xl font-bold text-green-600">
                            ${initialData.total_sales.toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Orders
                        </h3>
                        <p className="text-3xl font-bold text-blue-600">
                            {initialData.order_count}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Avg. Order Value
                        </h3>
                        <p className="text-3xl font-bold text-purple-600">
                            ${initialData.average_order_value.toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">
                            Sales Trend
                        </h3>
                        <Line
                            data={salesData}
                            options={{ maintainAspectRatio: false }}
                        />
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">
                            Top Products
                        </h3>
                        <Pie
                            data={topProductsData}
                            options={{ maintainAspectRatio: false }}
                        />
                    </div>
                </div>
            </div>
        </Layout>
    );
}
