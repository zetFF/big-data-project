import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import { Dialog } from "@headlessui/react";
import FileUpload from "@/Components/FileUpload";

export default function TicketForm({ categories, orders }) {
    const [isAttaching, setIsAttaching] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        subject: "",
        description: "",
        category: "",
        priority: "medium",
        order_id: "",
        attachments: [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("support.tickets.store"), {
            onSuccess: () => {
                reset();
                // Show success message
            },
        });
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Create Support Ticket</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Subject
                    </label>
                    <input
                        type="text"
                        value={data.subject}
                        onChange={(e) => setData("subject", e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {errors.subject && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.subject}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Category
                    </label>
                    <select
                        value={data.category}
                        onChange={(e) => setData("category", e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Related Order (Optional)
                    </label>
                    <select
                        value={data.order_id}
                        onChange={(e) => setData("order_id", e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option value="">Select an order</option>
                        {orders.map((order) => (
                            <option key={order.id} value={order.id}>
                                Order #{order.id} - {order.created_at}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Description
                    </label>
                    <textarea
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Priority
                    </label>
                    <select
                        value={data.priority}
                        onChange={(e) => setData("priority", e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>

                <div>
                    <FileUpload
                        onFileSelect={(files) => setData("attachments", files)}
                        multiple
                        accept="image/*,.pdf"
                    />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                    {processing ? "Submitting..." : "Submit Ticket"}
                </button>
            </form>
        </div>
    );
}
