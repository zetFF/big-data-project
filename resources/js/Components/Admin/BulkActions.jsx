import React from "react";
import { useForm } from "@inertiajs/react";

export default function BulkActions({ selectedItems, actions, route }) {
    const { post, processing } = useForm({
        ids: selectedItems,
        action: "",
        value: "",
    });

    const handleAction = (action, value = null) => {
        post(route, {
            data: {
                ids: selectedItems,
                action,
                value,
            },
            preserveScroll: true,
        });
    };

    return (
        <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow">
            <span className="text-sm text-gray-600">
                {selectedItems.length} items selected
            </span>

            <div className="flex-1 flex items-center space-x-2">
                {actions.map((action) => (
                    <button
                        key={action.value}
                        onClick={() =>
                            handleAction(
                                action.value,
                                action.requiresValue
                                    ? prompt(action.prompt)
                                    : null
                            )
                        }
                        disabled={processing}
                        className="px-4 py-2 text-sm font-medium text-white rounded-md bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {action.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
