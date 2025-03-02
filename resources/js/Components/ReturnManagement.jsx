import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import { formatCurrency, formatDate } from "@/utils";

export default function ReturnManagement({
    order,
    returnablePeriod,
    returnMethods,
    refundMethods,
    returnReasons,
}) {
    const [selectedItems, setSelectedItems] = useState([]);
    const [summary, setSummary] = useState({
        totalItems: 0,
        totalRefund: 0,
        shippingFee: 0,
        restockingFee: 0,
        finalRefund: 0,
    });

    const { data, setData, post, processing, errors } = useForm({
        order_id: order.id,
        reason: "",
        return_method: "",
        refund_method: "",
        notes: "",
        items: [],
    });

    const toggleItem = (orderItem) => {
        const existingItem = selectedItems.find(
            (item) => item.order_item_id === orderItem.id
        );

        if (existingItem) {
            setSelectedItems(
                selectedItems.filter(
                    (item) => item.order_item_id !== orderItem.id
                )
            );
        } else {
            setSelectedItems([
                ...selectedItems,
                {
                    order_item_id: orderItem.id,
                    product_id: orderItem.product_id,
                    product_name: orderItem.product.name,
                    quantity: 1,
                    max_quantity:
                        orderItem.quantity - (orderItem.returned_quantity || 0),
                    unit_price: orderItem.unit_price,
                    reason: "",
                    condition: "unused",
                },
            ]);
        }
    };

    const updateItemQuantity = (orderItemId, quantity) => {
        setSelectedItems(
            selectedItems.map((item) => {
                if (item.order_item_id === orderItemId) {
                    return {
                        ...item,
                        quantity: Math.min(quantity, item.max_quantity),
                    };
                }
                return item;
            })
        );
    };

    const updateItemReason = (orderItemId, reason) => {
        setSelectedItems(
            selectedItems.map((item) => {
                if (item.order_item_id === orderItemId) {
                    return { ...item, reason };
                }
                return item;
            })
        );
    };

    const updateItemCondition = (orderItemId, condition) => {
        setSelectedItems(
            selectedItems.map((item) => {
                if (item.order_item_id === orderItemId) {
                    return { ...item, condition };
                }
                return item;
            })
        );
    };

    React.useEffect(() => {
        const totalItems = selectedItems.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        const totalRefund = selectedItems.reduce(
            (sum, item) => sum + item.unit_price * item.quantity,
            0
        );

        const shippingFee = data.return_method === "shipping" ? 5.99 : 0;
        const restockingFee = totalRefund * 0.1; // 10% restocking fee

        setSummary({
            totalItems,
            totalRefund,
            shippingFee,
            restockingFee,
            finalRefund: totalRefund - shippingFee - restockingFee,
        });

        setData("items", selectedItems);
    }, [selectedItems, data.return_method]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("returns.store"));
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Create Return Request
                </h2>

                <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Order Details
                    </h3>
                    <div className="bg-gray-50 rounded p-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Order Number
                                </p>
                                <p className="font-medium">{order.number}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">
                                    Order Date
                                </p>
                                <p className="font-medium">
                                    {formatDate(order.created_at)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">
                                    Return Window
                                </p>
                                <p className="font-medium">
                                    Expires on{" "}
                                    {formatDate(order.return_window_ends)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Select Items */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">
                            Select Items to Return
                        </h3>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Select
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Quantity
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Reason
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Condition
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {order.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.some(
                                                        (i) =>
                                                            i.order_item_id ===
                                                            item.id
                                                    )}
                                                    onChange={() =>
                                                        toggleItem(item)
                                                    }
                                                    disabled={!item.returnable}
                                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <img
                                                        src={
                                                            item.product
                                                                .thumbnail
                                                        }
                                                        alt={item.product.name}
                                                        className="h-10 w-10 rounded object-cover"
                                                    />
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {item.product.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {formatCurrency(
                                                                item.unit_price
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {selectedItems.some(
                                                    (i) =>
                                                        i.order_item_id ===
                                                        item.id
                                                ) && (
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max={
                                                            item.quantity -
                                                            (item.returned_quantity ||
                                                                0)
                                                        }
                                                        value={
                                                            selectedItems.find(
                                                                (i) =>
                                                                    i.order_item_id ===
                                                                    item.id
                                                            ).quantity
                                                        }
                                                        onChange={(e) =>
                                                            updateItemQuantity(
                                                                item.id,
                                                                parseInt(
                                                                    e.target
                                                                        .value
                                                                )
                                                            )
                                                        }
                                                        className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {selectedItems.some(
                                                    (i) =>
                                                        i.order_item_id ===
                                                        item.id
                                                ) && (
                                                    <select
                                                        value={
                                                            selectedItems.find(
                                                                (i) =>
                                                                    i.order_item_id ===
                                                                    item.id
                                                            ).reason
                                                        }
                                                        onChange={(e) =>
                                                            updateItemReason(
                                                                item.id,
                                                                e.target.value
                                                            )
                                                        }
                                                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    >
                                                        <option value="">
                                                            Select reason
                                                        </option>
                                                        {returnReasons.map(
                                                            (reason) => (
                                                                <option
                                                                    key={
                                                                        reason.id
                                                                    }
                                                                    value={
                                                                        reason.id
                                                                    }
                                                                >
                                                                    {
                                                                        reason.name
                                                                    }
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {selectedItems.some(
                                                    (i) =>
                                                        i.order_item_id ===
                                                        item.id
                                                ) && (
                                                    <select
                                                        value={
                                                            selectedItems.find(
                                                                (i) =>
                                                                    i.order_item_id ===
                                                                    item.id
                                                            ).condition
                                                        }
                                                        onChange={(e) =>
                                                            updateItemCondition(
                                                                item.id,
                                                                e.target.value
                                                            )
                                                        }
                                                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    >
                                                        <option value="unused">
                                                            Unused
                                                        </option>
                                                        <option value="opened">
                                                            Opened
                                                        </option>
                                                        <option value="damaged">
                                                            Damaged
                                                        </option>
                                                    </select>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Return Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Return Method
                            </label>
                            <select
                                value={data.return_method}
                                onChange={(e) =>
                                    setData("return_method", e.target.value)
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Select return method</option>
                                {returnMethods.map((method) => (
                                    <option key={method.id} value={method.id}>
                                        {method.name}
                                    </option>
                                ))}
                            </select>
                            {errors.return_method && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.return_method}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Refund Method
                            </label>
                            <select
                                value={data.refund_method}
                                onChange={(e) =>
                                    setData("refund_method", e.target.value)
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Select refund method</option>
                                {refundMethods.map((method) => (
                                    <option key={method.id} value={method.id}>
                                        {method.name}
                                    </option>
                                ))}
                            </select>
                            {errors.refund_method && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.refund_method}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Additional Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Additional Notes
                        </label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData("notes", e.target.value)}
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Any additional information about your return..."
                        />
                    </div>

                    {/* Return Summary */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Return Summary
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Total Items</span>
                                <span>{summary.totalItems}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Total Refund Amount</span>
                                <span>
                                    {formatCurrency(summary.totalRefund)}
                                </span>
                            </div>
                            {summary.shippingFee > 0 && (
                                <div className="flex justify-between text-red-600">
                                    <span>Return Shipping Fee</span>
                                    <span>
                                        -{formatCurrency(summary.shippingFee)}
                                    </span>
                                </div>
                            )}
                            {summary.restockingFee > 0 && (
                                <div className="flex justify-between text-red-600">
                                    <span>Restocking Fee (10%)</span>
                                    <span>
                                        -{formatCurrency(summary.restockingFee)}
                                    </span>
                                </div>
                            )}
                            <div className="border-t pt-2 font-bold">
                                <div className="flex justify-between">
                                    <span>Final Refund Amount</span>
                                    <span>
                                        {formatCurrency(summary.finalRefund)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing || selectedItems.length === 0}
                            className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {processing
                                ? "Processing..."
                                : "Submit Return Request"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
