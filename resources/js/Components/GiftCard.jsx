import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import DatePicker from "react-datepicker";
import { formatCurrency } from "@/utils";

export default function GiftCard({ designTemplates }) {
    const [selectedTemplate, setSelectedTemplate] = useState("default");

    const { data, setData, post, processing, errors } = useForm({
        amount: "",
        recipient_email: "",
        recipient_name: "",
        message: "",
        design_template: "default",
        delivery_date: new Date(),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("gift-cards.purchase"));
    };

    const presetAmounts = [25, 50, 100, 200, 500];

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Gift Card Preview */}
                <div className={`p-6 ${selectedTemplate}`}>
                    <div className="aspect-video rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 p-8 text-white">
                        <div className="text-2xl font-bold mb-4">Gift Card</div>
                        <div className="text-4xl font-bold mb-4">
                            {data.amount
                                ? formatCurrency(data.amount)
                                : "$0.00"}
                        </div>
                        {data.recipient_name && (
                            <div className="text-lg">
                                For: {data.recipient_name}
                            </div>
                        )}
                        {data.message && (
                            <div className="mt-4 italic">{data.message}</div>
                        )}
                    </div>
                </div>

                {/* Purchase Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Amount Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Select Amount
                        </label>
                        <div className="mt-2 grid grid-cols-3 gap-3">
                            {presetAmounts.map((amount) => (
                                <button
                                    key={amount}
                                    type="button"
                                    onClick={() => setData("amount", amount)}
                                    className={`
                                        py-2 px-4 rounded-md text-center
                                        ${
                                            data.amount === amount
                                                ? "bg-indigo-600 text-white"
                                                : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                                        }
                                    `}
                                >
                                    {formatCurrency(amount)}
                                </button>
                            ))}
                            <input
                                type="number"
                                placeholder="Custom amount"
                                value={data.amount}
                                onChange={(e) =>
                                    setData("amount", e.target.value)
                                }
                                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Recipient Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Recipient's Name
                            </label>
                            <input
                                type="text"
                                value={data.recipient_name}
                                onChange={(e) =>
                                    setData("recipient_name", e.target.value)
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Recipient's Email
                            </label>
                            <input
                                type="email"
                                value={data.recipient_email}
                                onChange={(e) =>
                                    setData("recipient_email", e.target.value)
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Personal Message */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Personal Message (Optional)
                        </label>
                        <textarea
                            value={data.message}
                            onChange={(e) => setData("message", e.target.value)}
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Design Template */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Select Design
                        </label>
                        <div className="mt-2 grid grid-cols-4 gap-4">
                            {designTemplates.map((template) => (
                                <button
                                    key={template.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedTemplate(template.id);
                                        setData("design_template", template.id);
                                    }}
                                    className={`
                                        aspect-video rounded-lg border-2
                                        ${
                                            selectedTemplate === template.id
                                                ? "border-indigo-600"
                                                : "border-gray-200"
                                        }
                                    `}
                                >
                                    <img
                                        src={template.preview}
                                        alt={template.name}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Delivery Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Delivery Date
                        </label>
                        <DatePicker
                            selected={data.delivery_date}
                            onChange={(date) => setData("delivery_date", date)}
                            minDate={new Date()}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {processing ? "Processing..." : "Purchase Gift Card"}
                    </button>
                </form>
            </div>
        </div>
    );
}
