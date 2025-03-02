import React from "react";

export default function StatisticCard({ title, value, icon }) {
    const getIcon = () => {
        switch (icon) {
            case "dollar":
                return (
                    <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                );
            // Add other icon cases here
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-500">
                    {getIcon()}
                </div>
                <div className="ml-4">
                    <h3 className="text-gray-500 text-sm">{title}</h3>
                    <p className="text-2xl font-semibold">{value}</p>
                </div>
            </div>
        </div>
    );
}
