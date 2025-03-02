import React, { useState } from "react";
import { useForm } from "@inertiajs/react";

export default function ProductCustomization({ product, customizations }) {
    const [selectedOptions, setSelectedOptions] = useState({});
    const [totalPrice, setTotalPrice] = useState(product.price);

    const { data, setData, post, processing } = useForm({
        customizations: [],
        quantity: 1,
    });

    const handleCustomizationChange = (customization, value) => {
        const newOptions = {
            ...selectedOptions,
            [customization.id]: value,
        };
        setSelectedOptions(newOptions);

        // Recalculate total price
        let newTotal = product.price;
        Object.keys(newOptions).forEach((id) => {
            const option = customizations.find((c) => c.id === parseInt(id));
            if (option) {
                newTotal += parseFloat(option.additional_price);
            }
        });
        setTotalPrice(newTotal);

        // Update form data
        setData(
            "customizations",
            Object.entries(newOptions).map(([id, value]) => ({
                id: parseInt(id),
                value,
            }))
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("products.customize", product.id));
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                {customizations.map((customization) => (
                    <div
                        key={customization.id}
                        className="border p-4 rounded-lg"
                    >
                        <label className="block text-sm font-medium text-gray-700">
                            {customization.name}
                            {customization.required && (
                                <span className="text-red-500">*</span>
                            )}
                        </label>

                        {customization.type === "text" && (
                            <input
                                type="text"
                                maxLength={customization.max_length}
                                onChange={(e) =>
                                    handleCustomizationChange(
                                        customization,
                                        e.target.value
                                    )
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required={customization.required}
                            />
                        )}

                        {customization.type === "select" && (
                            <select
                                onChange={(e) =>
                                    handleCustomizationChange(
                                        customization,
                                        e.target.value
                                    )
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required={customization.required}
                            >
                                <option value="">Select an option</option>
                                {customization.options.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        )}

                        {customization.type === "color" && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {customization.options.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() =>
                                            handleCustomizationChange(
                                                customization,
                                                color
                                            )
                                        }
                                        className={`w-8 h-8 rounded-full border-2 ${
                                            selectedOptions[
                                                customization.id
                                            ] === color
                                                ? "border-black"
                                                : "border-transparent"
                                        }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        )}

                        {customization.additional_price > 0 && (
                            <p className="mt-1 text-sm text-gray-500">
                                +${customization.additional_price}
                            </p>
                        )}
                    </div>
                ))}

                <div className="flex items-center justify-between border-t pt-4">
                    <div>
                        <p className="text-lg font-semibold">Total Price:</p>
                        <p className="text-2xl font-bold text-indigo-600">
                            ${totalPrice.toFixed(2)}
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                        Add to Cart
                    </button>
                </div>
            </form>
        </div>
    );
}
