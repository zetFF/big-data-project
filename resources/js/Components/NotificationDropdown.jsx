import React, { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";

export default function NotificationDropdown({ notifications, unreadCount }) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        Echo.private(`App.Models.User.${auth.user.id}`).notification(
            (notification) => {
                notifications.unshift(notification);
                unreadCount.value++;
            }
        );
    }, []);

    const markAsRead = async (notification) => {
        await axios.post(route("notifications.mark-as-read", notification.id));
        notification.read_at = new Date();
        unreadCount.value--;
    };

    const markAllAsRead = async () => {
        await axios.post(route("notifications.mark-all-as-read"));
        notifications.forEach((n) => (n.read_at = new Date()));
        unreadCount.value = 0;
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900"
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>
                {unreadCount.value > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount.value}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50">
                    <div className="p-4 border-b">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">
                                Notifications
                            </h3>
                            {unreadCount.value > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b hover:bg-gray-50 ${
                                        !notification.read_at
                                            ? "bg-blue-50"
                                            : ""
                                    }`}
                                    onClick={() => markAsRead(notification)}
                                >
                                    <p className="font-semibold">
                                        {notification.data.title}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {notification.data.message}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(
                                            notification.created_at
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-500">
                                No notifications
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
