import React, { useState, useEffect } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";
import { formatCurrency, formatNumber, formatDate } from "@/utils";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function AdvancedReporting({
    salesReport,
    inventoryReport,
    customerReport,
    vendorReport,
}) {
    const [activeTab, setActiveTab] = useState("sales");
    const [timeRange, setTimeRange] = useState("30d");
    const [chartType, setChartType] = useState("line");
    const [loading, setLoading] = useState(false);

    const salesChartData = {
        labels: salesReport.trends.daily.map((day) => formatDate(day.date)),
        datasets: [
            {
                label: "Revenue",
                data: salesReport.trends.daily.map((day) => day.revenue),
                borderColor: "rgb(75, 192, 192)",
                backgroundColor: "rgba(75, 192, 192, 0.5)",
            },
            {
                label: "Orders",
                data: salesReport.trends.daily.map((day) => day.orders),
                borderColor: "rgb(255, 99, 132)",
                backgroundColor: "rgba(255, 99, 132, 0.5)",
            },
        ],
    };

    const inventoryDistributionData = {
        labels: ["Optimal", "Low Stock", "Out of Stock"],
        datasets: [
            {
                data: [
                    inventoryReport.stock_levels.distribution.optimal,
                    inventoryReport.stock_levels.distribution.low,
                    inventoryReport.stock_levels.distribution.out_of_stock,
                ],
                backgroundColor: [
                    "rgba(75, 192, 192, 0.5)",
                    "rgba(255, 206, 86, 0.5)",
                    "rgba(255, 99, 132, 0.5)",
                ],
                borderColor: [
                    "rgb(75, 192, 192)",
                    "rgb(255, 206, 86)",
                    "rgb(255, 99, 132)",
                ],
                borderWidth: 1,
            },
        ],
    };

    const customerSegmentationData = {
        labels: ["VIP", "Regular", "Occasional", "One-time"],
        datasets: [
            {
                data: [
                    customerReport.segmentation.by_value.vip,
                    customerReport.segmentation.by_value.regular,
                    customerReport.segmentation.by_value.occasional,
                    customerReport.segmentation.by_value.one_time,
                ],
                backgroundColor: [
                    "rgba(153, 102, 255, 0.5)",
                    "rgba(75, 192, 192, 0.5)",
                    "rgba(255, 206, 86, 0.5)",
                    "rgba(255, 99, 132, 0.5)",
                ],
                borderColor: [
                    "rgb(153, 102, 255)",
                    "rgb(75, 192, 192)",
                    "rgb(255, 206, 86)",
                    "rgb(255, 99, 132)",
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="space-y-6">
            {/* Report Navigation */}
            <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                    <nav
                        className="-mb-px flex space-x-8 px-6"
                        aria-label="Tabs"
                    >
                        {["sales", "inventory", "customers", "vendors"].map(
                            (tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`
                                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                                    ${
                                        activeTab === tab
                                            ? "border-indigo-500 text-indigo-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }
                                `}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}{" "}
                                    Report
                                </button>
                            )
                        )}
                    </nav>
                </div>
            </div>

            {/* Report Controls */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center">
                    <div className="flex space-x-4">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                            <option value="1y">Last year</option>
                        </select>
                        <select
                            value={chartType}
                            onChange={(e) => setChartType(e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="line">Line Chart</option>
                            <option value="bar">Bar Chart</option>
                            <option value="pie">Pie Chart</option>
                        </select>
                    </div>
                    <button
                        onClick={() => {
                            /* Export functionality */
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Export Report
                    </button>
                </div>
            </div>

            {/* Report Content */}
            <div className="bg-white rounded-lg shadow">
                {activeTab === "sales" && (
                    <div className="p-6 space-y-6">
                        {/* Sales Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-500">
                                    Total Revenue
                                </h4>
                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                    {formatCurrency(
                                        salesReport.summary.total_revenue
                                    )}
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                    {salesReport.summary.total_orders} orders
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-500">
                                    Average Order Value
                                </h4>
                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                    {formatCurrency(
                                        salesReport.summary.average_order_value
                                    )}
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-500">
                                    Items Sold
                                </h4>
                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                    {formatNumber(
                                        salesReport.summary.total_items_sold
                                    )}
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-500">
                                    Conversion Rate
                                </h4>
                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                    {(
                                        salesReport.summary.conversion_rate *
                                        100
                                    ).toFixed(1)}
                                    %
                                </p>
                            </div>
                        </div>

                        {/* Sales Chart */}
                        <div className="h-96">
                            {chartType === "line" && (
                                <Line
                                    data={salesChartData}
                                    options={{ maintainAspectRatio: false }}
                                />
                            )}
                            {chartType === "bar" && (
                                <Bar
                                    data={salesChartData}
                                    options={{ maintainAspectRatio: false }}
                                />
                            )}
                        </div>

                        {/* Top Products Table */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Top Selling Products
                            </h3>
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
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Profit Margin
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {salesReport.top_products.map(
                                            (product) => (
                                                <tr key={product.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {product.name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">
                                                            {formatNumber(
                                                                product.units_sold
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {formatCurrency(
                                                                product.revenue
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {(
                                                                product.profit_margin *
                                                                100
                                                            ).toFixed(1)}
                                                            %
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "inventory" && (
                    <div className="p-6 space-y-6">
                        {/* Inventory Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-500">
                                    Total Stock Value
                                </h4>
                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                    {formatCurrency(
                                        inventoryReport.summary
                                            .total_stock_value
                                    )}
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-500">
                                    Low Stock Items
                                </h4>
                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                    {inventoryReport.summary.low_stock_items}
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-500">
                                    Out of Stock Items
                                </h4>
                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                    {inventoryReport.summary.out_of_stock_items}
                                </p>
                            </div>
                        </div>

                        {/* Inventory Distribution Chart */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Stock Level Distribution
                                </h3>
                                <div className="h-64">
                                    <Pie data={inventoryDistributionData} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Reorder Recommendations
                                </h3>
                                <div className="space-y-4">
                                    {inventoryReport.reorder_recommendations.map(
                                        (item) => (
                                            <div
                                                key={item.product_id}
                                                className="bg-gray-50 p-4 rounded-lg"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {item.name}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Current Stock:{" "}
                                                            {item.current_stock}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            Order:{" "}
                                                            {
                                                                item.recommended_quantity
                                                            }{" "}
                                                            units
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Est. Cost:{" "}
                                                            {formatCurrency(
                                                                item.estimated_cost
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "customers" && (
                    <div className="p-6 space-y-6">
                        {/* Customer Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-500">
                                    Total Customers
                                </h4>
                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                    {formatNumber(
                                        customerReport.summary.total_customers
                                    )}
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-500">
                                    Active Customers
                                </h4>
                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                    {formatNumber(
                                        customerReport.summary.active_customers
                                    )}
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-500">
                                    Average Customer Value
                                </h4>
                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                    {formatCurrency(
                                        customerReport.summary
                                            .average_customer_value
                                    )}
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-500">
                                    Retention Rate
                                </h4>
                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                    {(
                                        customerReport.summary
                                            .customer_retention_rate * 100
                                    ).toFixed(1)}
                                    %
                                </p>
                            </div>
                        </div>

                        {/* Customer Segmentation Chart */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Customer Segmentation
                                </h3>
                                <div className="h-64">
                                    <Pie data={customerSegmentationData} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Customer Lifetime Value
                                </h3>
                                <div className="space-y-4">
                                    {Object.entries(
                                        customerReport.lifetime_value
                                    ).map(([segment, value]) => (
                                        <div
                                            key={segment}
                                            className="bg-gray-50 p-4 rounded-lg"
                                        >
                                            <div className="flex justify-between items-center">
                                                <p className="font-medium text-gray-900">
                                                    {segment
                                                        .replace("_", " ")
                                                        .toUpperCase()}
                                                </p>
                                                <p className="text-lg font-bold text-gray-900">
                                                    {formatCurrency(value)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
