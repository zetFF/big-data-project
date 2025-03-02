import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Line, Bar } from "react-chartjs-2";
import DateRangePicker from "@/Components/DateRangePicker";

export default function Reports({
    salesReport,
    topProducts,
    vendorPerformance,
}) {
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
        endDate: new Date(),
    });

    const salesChartData = {
        labels: salesReport.map((item) => item.date),
        datasets: [
            {
                label: "Sales",
                data: salesReport.map((item) => item.total_sales),
                borderColor: "rgb(75, 192, 192)",
                tension: 0.1,
            },
            {
                label: "Orders",
                data: salesReport.map((item) => item.total_orders),
                borderColor: "rgb(153, 102, 255)",
                tension: 0.1,
            },
        ],
    };

    const topProductsChartData = {
        labels: topProducts.map((product) => product.name),
        datasets: [
            {
                label: "Units Sold",
                data: topProducts.map((product) => product.total_sold),
                backgroundColor: "rgba(75, 192, 192, 0.5)",
            },
        ],
    };

    return (
        <AdminLayout>
            <Head title="Sales Reports" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Date Range Picker */}
                    <div className="mb-6">
                        <DateRangePicker
                            startDate={dateRange.startDate}
                            endDate={dateRange.endDate}
                            onChange={setDateRange}
                        />
                        <button
                            onClick={() =>
                                (window.location.href = route(
                                    "admin.reports.export",
                                    {
                                        start_date: dateRange.startDate,
                                        end_date: dateRange.endDate,
                                    }
                                ))
                            }
                            className="ml-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            Export to Excel
                        </button>
                    </div>

                    {/* Sales Overview */}
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <h2 className="text-xl font-semibold mb-4">
                            Sales Overview
                        </h2>
                        <Line data={salesChartData} />
                    </div>

                    {/* Top Products */}
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <h2 className="text-xl font-semibold mb-4">
                            Top Products
                        </h2>
                        <Bar data={topProductsChartData} />
                    </div>

                    {/* Vendor Performance */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">
                            Vendor Performance
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Vendor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Orders
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Revenue
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {vendorPerformance.map((vendor) => (
                                        <tr key={vendor.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {vendor.shop_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {vendor.total_orders}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                ${vendor.total_revenue}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
