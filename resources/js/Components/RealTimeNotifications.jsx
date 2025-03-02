import React, { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";

export default function RealTimeNotifications() {
    const { auth } = usePage().props;
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (auth.user.role === "vendor") {
            Echo.private(`vendor.${auth.user.vendor_profile.id}`).listen(
                "NewOrderNotification",
                (e) => {
                    setNotifications((prev) => [
                        {
                            id: Date.now(),
                            message: `New order #${e.order_number} received!`,
                            amount: e.total_amount,
                            customer: e.customer_name,
                            time: new Date(),
                            ...e,
                        },
                        ...prev,
                    ]);
                }
            );
        }
    }, []);

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className="bg-white rounded-lg shadow-lg p-4 mb-2 max-w-sm animate-slide-in"
                >
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-lg">
                            {notification.message}
                        </h4>
                        <button
                            onClick={() =>
                                setNotifications((prev) =>
                                    prev.filter((n) => n.id !== notification.id)
                                )
                            }
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ×
                        </button>
                    </div>
                    <p className="text-sm text-gray-600">
                        Customer: {notification.customer}
                    </p>
                    <p className="text-sm text-gray-600">
                        Amount: ${notification.amount}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.time).toLocaleTimeString()}
                    </p>
                </div>
            ))}
        </div>
    );
}
