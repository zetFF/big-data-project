import React, { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { formatCurrency } from "@/utils";

export default function ShippingCalculator({ order, initialPostalCode = "" }) {
    const [shippingOptions, setShippingOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);

    const { data, setData, post, processing } = useForm({
        postal_code: initialPostalCode,
    });

    const calculateShipping = () => {
        setLoading(true);
        post(route("shipping.calculate"), {
            preserveScroll: true,
            onSuccess: (response) => {
                setShippingOptions(response.options);
                setLoading(false);
            },
        });
    };

    useEffect(() => {
        if (initialPostalCode) {
            calculateShipping();
        }
    }, []);

    return (
        <div className="space-y-6">
            {/* Postal Code Input */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Enter Postal Code
                </label>
                <div className="mt-1 flex space-x-3">
                    <input
                        type="text"
                        value={data.postal_code}
                        onChange={(e) => setData("postal_code", e.target.value)}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Enter postal code"
                    />
                    <button
                        onClick={calculateShipping}
                        disabled={processing || !data.postal_code}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                        Calculate
                    </button>
                </div>
            </div>

            {/* Shipping Options */}
            {loading ? (
                <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">
                        Calculating shipping options...
                    </p>
                </div>
            ) : (
                shippingOptions.length > 0 && (
                    <div className="space-y-4">
                        {shippingOptions.map((option) => (
                            <div
                                key={option.method_id}
                                className={`
                                border rounded-lg p-4 cursor-pointer
                                ${
                                    selectedOption?.method_id ===
                                    option.method_id
                                        ? "border-indigo-600 bg-indigo-50"
                                        : "border-gray-200 hover:border-gray-300"
                                }
                            `}
                                onClick={() => setSelectedOption(option)}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium">
                                            {option.name}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {option.carrier} - Estimated
                                            delivery in{" "}
                                            {option.delivery_time.min_days}-
                                            {option.delivery_time.max_days} days
                                        </p>
                                        {option.tracking_available && (
                                            <span className="text-xs text-green-600">
                                                Tracking available
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-lg font-bold">
                                        {formatCurrency(option.rate)}
                                    </div>
                                </div>

                                {option.restrictions.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-sm text-red-600">
                                            Restrictions:
                                        </p>
                                        <ul className="text-xs text-red-600 list-disc list-inside">
                                            {option.restrictions.map(
                                                (restriction, index) => (
                                                    <li key={index}>
                                                        {restriction}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )
            )}

            {!loading && shippingOptions.length === 0 && data.postal_code && (
                <div className="text-center py-4 text-gray-500">
                    No shipping options available for this postal code.
                </div>
            )}
        </div>
    );
}
