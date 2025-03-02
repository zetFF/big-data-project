import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import { formatCurrency } from "@/utils";

export default function LoyaltyProgram({
    user,
    pointsHistory,
    availableRewards,
    tiers,
}) {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <div className="space-y-6">
            {/* Loyalty Program Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <h3 className="text-lg font-medium">Current Tier</h3>
                        <p className="text-2xl font-bold">
                            {user.loyalty_tier.name}
                        </p>
                        <p className="text-sm opacity-75">
                            {user.loyalty_tier.description}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Points Balance</h3>
                        <p className="text-2xl font-bold">
                            {user.loyalty_points_balance}
                        </p>
                        <p className="text-sm opacity-75">
                            Points expire: {user.points_expiry_date}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Next Tier</h3>
                        <p className="text-2xl font-bold">
                            {user.points_to_next_tier} points needed
                        </p>
                        <div className="mt-2 h-2 bg-white/20 rounded-full">
                            <div
                                className="h-full bg-white rounded-full"
                                style={{ width: `${user.tier_progress}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {["overview", "rewards", "history", "tiers"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`
                                py-4 px-1 border-b-2 font-medium text-sm
                                ${
                                    activeTab === tab
                                        ? "border-indigo-600 text-indigo-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }
                            `}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium mb-4">
                            Current Benefits
                        </h3>
                        <ul className="space-y-3">
                            {user.loyalty_tier.benefits.map(
                                (benefit, index) => (
                                    <li
                                        key={index}
                                        className="flex items-center"
                                    >
                                        <svg
                                            className="h-5 w-5 text-green-500 mr-2"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        {benefit}
                                    </li>
                                )
                            )}
                        </ul>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium mb-4">
                            Points Summary
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span>Points earned this month</span>
                                <span className="font-medium">
                                    {user.points_earned_this_month}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Points redeemed this month</span>
                                <span className="font-medium">
                                    {user.points_redeemed_this_month}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Points expiring soon</span>
                                <span className="font-medium text-red-600">
                                    {user.points_expiring_soon}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "rewards" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {availableRewards.map((reward) => (
                        <div
                            key={reward.id}
                            className="bg-white rounded-lg shadow p-6"
                        >
                            <h3 className="text-lg font-medium">
                                {reward.name}
                            </h3>
                            <p className="text-gray-500 mt-1">
                                {reward.description}
                            </p>
                            <div className="mt-4">
                                <span className="text-2xl font-bold">
                                    {reward.points_required}
                                </span>
                                <span className="text-gray-500"> points</span>
                            </div>
                            {reward.can_redeem ? (
                                <button className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
                                    Redeem Reward
                                </button>
                            ) : (
                                <button
                                    disabled
                                    className="mt-4 w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-md cursor-not-allowed"
                                >
                                    Not Available
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {activeTab === "history" && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Activity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Points
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Expires
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {pointsHistory.map((entry) => (
                                <tr key={entry.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {entry.date}
                                    </td>
                                    <td className="px-6 py-4">
                                        {entry.description}
                                    </td>
                                    <td
                                        className={`px-6 py-4 whitespace-nowrap ${
                                            entry.points > 0
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }`}
                                    >
                                        {entry.points > 0 ? "+" : ""}
                                        {entry.points}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        {entry.expires_at}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === "tiers" && (
                <div className="space-y-6">
                    {tiers.map((tier, index) => (
                        <div
                            key={tier.id}
                            className={`
                                bg-white rounded-lg shadow p-6
                                ${
                                    user.loyalty_tier.level >= tier.level
                                        ? "border-2 border-indigo-600"
                                        : ""
                                }
                            `}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium">
                                        {tier.name}
                                    </h3>
                                    <p className="text-gray-500">
                                        {tier.description}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">
                                        Qualifying Points
                                    </p>
                                    <p className="text-xl font-bold">
                                        {tier.qualifying_points}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <h4 className="font-medium mb-2">Benefits</h4>
                                <ul className="grid grid-cols-2 gap-2">
                                    {tier.benefits.map((benefit, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center text-sm"
                                        >
                                            <svg
                                                className="h-4 w-4 text-indigo-600 mr-2"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
