import React from "react";
import { Link } from "@inertiajs/react";

export default function RecentOrders({ orders }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                        <tr key={order.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <Link
                                    href={route("admin.orders.show", order.id)}
                                    className="text-blue-600 hover:text-blue-900"
                                >
                                    {order.order_number}
                                </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {order.user.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                ${order.total_amount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        order.status === "completed"
                                            ? "bg-green-100 text-green-800"
                                            : order.status === "processing"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-gray-100 text-gray-800"
                                    }`}
                                >
                                    {order.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {new Date(
                                    order.created_at
                                ).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
