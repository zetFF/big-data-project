import React from "react";
import { usePage } from "@inertiajs/react";

export default function Notifications() {
    const { notifications } = usePage().props;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className="bg-white rounded-lg shadow-lg p-4 mb-2 max-w-sm"
                >
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg
                                className="h-6 w-6 text-green-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <div className="ml-3 w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                                {notification.data.message}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                                {notification.created_at}
                            </p>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex">
                            <button
                                className="text-gray-400 hover:text-gray-500"
                                onClick={() => markAsRead(notification.id)}
                            >
                                <span className="sr-only">Close</span>
                                <svg
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
