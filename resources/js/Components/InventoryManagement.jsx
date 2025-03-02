import React, { useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import { formatCurrency } from "@/utils";

export default function InventoryManagement({
    product,
    stockMovements,
    forecast,
    optimizedLevels,
    warehouses,
}) {
    const [selectedWarehouse, setSelectedWarehouse] = useState("all");
    const [timeRange, setTimeRange] = useState("30d");

    const stockData = {
        labels: stockMovements.map((m) => m.date),
        datasets: [
            {
                label: "Stock Level",
                data: stockMovements.map((m) => m.quantity),
                fill: false,
                borderColor: "rgb(75, 192, 192)",
                tension: 0.1,
            },
        ],
    };

    const forecastData = {
        labels: forecast.map((f) => f.date),
        datasets: [
            {
                label: "Forecasted Demand",
                data: forecast.map((f) => f.demand),
                fill: false,
                borderColor: "rgb(255, 99, 132)",
                tension: 0.1,
            },
        ],
    };

    return (
        <div className="space-y-6">
            {/* Inventory Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900">
                        Current Stock
                    </h3>
                    <p className="text-3xl font-bold text-indigo-600">
                        {product.stock}
                    </p>
                    <p className="text-sm text-gray-500">Units available</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900">
                        Reorder Point
                    </h3>
                    <p className="text-3xl font-bold text-yellow-600">
                        {optimizedLevels.reorder_point}
                    </p>
                    <p className="text-sm text-gray-500">Minimum stock level</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900">
                        Safety Stock
                    </h3>
                    <p className="text-3xl font-bold text-green-600">
                        {optimizedLevels.safety_stock}
                    </p>
                    <p className="text-sm text-gray-500">Buffer stock</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900">EOQ</h3>
                    <p className="text-3xl font-bold text-blue-600">
                        {optimizedLevels.economic_order_quantity}
                    </p>
                    <p className="text-sm text-gray-500">
                        Optimal order quantity
                    </p>
                </div>
            </div>

            {/* Stock Movement Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900">
                        Stock Movement
                    </h3>
                    <div className="flex space-x-4">
                        <select
                            value={selectedWarehouse}
                            onChange={(e) =>
                                setSelectedWarehouse(e.target.value)
                            }
                            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="all">All Warehouses</option>
                            {warehouses.map((warehouse) => (
                                <option key={warehouse.id} value={warehouse.id}>
                                    {warehouse.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                        </select>
                    </div>
                </div>
                <div className="h-64">
                    <Line
                        data={stockData}
                        options={{ maintainAspectRatio: false }}
                    />
                </div>
            </div>

            {/* Demand Forecast */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                    Demand Forecast
                </h3>
                <div className="h-64">
                    <Line
                        data={forecastData}
                        options={{ maintainAspectRatio: false }}
                    />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                    {forecast.map((f, index) => (
                        <div key={index} className="text-center">
                            <p className="text-sm text-gray-500">{f.date}</p>
                            <p className="text-lg font-medium">
                                {f.demand} units
                            </p>
                            <p className="text-xs text-gray-500">
                                {f.confidence}% confidence
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stock Movements Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Quantity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Reference
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Warehouse
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {stockMovements.map((movement) => (
                            <tr key={movement.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {movement.date}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            movement.type === "in"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                        }`}
                                    >
                                        {movement.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {movement.quantity}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {movement.reference}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {movement.warehouse}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
