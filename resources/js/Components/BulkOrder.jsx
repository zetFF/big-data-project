import React, { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { formatCurrency } from "@/utils";

export default function BulkOrder({
    products,
    priceTiers,
    volumeDiscounts,
    shippingOptions,
    paymentTerms,
}) {
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [summary, setSummary] = useState({
        subtotal: 0,
        discount: 0,
        shipping: 0,
        total: 0,
    });

    const { data, setData, post, processing, errors } = useForm({
        company_name: "",
        shipping_address: "",
        billing_address: "",
        expected_delivery_date: "",
        payment_terms: "net_30",
        po_number: "",
        notes: "",
        items: [],
    });

    const addProduct = (productId) => {
        const product = products.find((p) => p.id === productId);
        if (!product) return;

        setSelectedProducts([
            ...selectedProducts,
            {
                product_id: product.id,
                name: product.name,
                quantity: 1,
                unit_price: product.price,
                total_price: product.price,
            },
        ]);
    };

    const updateQuantity = (index, quantity) => {
        const newSelectedProducts = [...selectedProducts];
        const product = products.find(
            (p) => p.id === selectedProducts[index].product_id
        );

        // Calculate tiered pricing
        const tier = priceTiers[product.id]?.find(
            (t) => t.min_quantity <= quantity
        );
        const unitPrice = tier ? tier.unit_price : product.price;

        newSelectedProducts[index] = {
            ...newSelectedProducts[index],
            quantity: quantity,
            unit_price: unitPrice,
            total_price: unitPrice * quantity,
        };

        setSelectedProducts(newSelectedProducts);
    };

    const removeProduct = (index) => {
        setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
    };

    useEffect(() => {
        const subtotal = selectedProducts.reduce(
            (sum, item) => sum + item.total_price,
            0
        );

        // Calculate volume discount
        const discount = volumeDiscounts.reduce(
            (maxDiscount, discountTier) => {
                if (
                    subtotal >= discountTier.min_amount &&
                    discountTier.percentage > maxDiscount.percentage
                ) {
                    return discountTier;
                }
                return maxDiscount;
            },
            { percentage: 0 }
        ).percentage;

        const discountAmount = (subtotal * discount) / 100;

        setSummary({
            subtotal: subtotal,
            discount: discountAmount,
            shipping: 0, // Will be calculated based on selection
            total: subtotal - discountAmount,
        });

        setData("items", selectedProducts);
    }, [selectedProducts]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("bulk-orders.store"));
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Create Bulk Order
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Company Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Company Name
                            </label>
                            <input
                                type="text"
                                value={data.company_name}
                                onChange={(e) =>
                                    setData("company_name", e.target.value)
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            {errors.company_name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.company_name}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                PO Number
                            </label>
                            <input
                                type="text"
                                value={data.po_number}
                                onChange={(e) =>
                                    setData("po_number", e.target.value)
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Addresses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Shipping Address
                            </label>
                            <textarea
                                value={data.shipping_address}
                                onChange={(e) =>
                                    setData("shipping_address", e.target.value)
                                }
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            {errors.shipping_address && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.shipping_address}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Billing Address
                            </label>
                            <textarea
                                value={data.billing_address}
                                onChange={(e) =>
                                    setData("billing_address", e.target.value)
                                }
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            {errors.billing_address && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.billing_address}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Products */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Products
                            </h3>
                            <select
                                onChange={(e) =>
                                    addProduct(parseInt(e.target.value))
                                }
                                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Add Product</option>
                                {products.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="border rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Quantity
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Unit Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {selectedProducts.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {item.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) =>
                                                        updateQuantity(
                                                            index,
                                                            parseInt(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                    className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {formatCurrency(
                                                    item.unit_price
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {formatCurrency(
                                                    item.total_price
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeProduct(index)
                                                    }
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Order Summary
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{formatCurrency(summary.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                                <span>Volume Discount</span>
                                <span>-{formatCurrency(summary.discount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>{formatCurrency(summary.shipping)}</span>
                            </div>
                            <div className="border-t pt-2 font-bold">
                                <div className="flex justify-between">
                                    <span>Total</span>
                                    <span>{formatCurrency(summary.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={
                                processing || selectedProducts.length === 0
                            }
                            className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {processing ? "Processing..." : "Place Bulk Order"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
