import React from "react";
import { Head } from "@inertiajs/react";
import Layout from "@/Layouts/Layout";
import { Line } from "react-chartjs-2";
import { formatCurrency } from "@/utils";

export default function AffiliateDashboard({ stats, monthlyEarnings }) {
    const earningsData = {
        labels: monthlyEarnings.map((e) => e.month),
        datasets: [
            {
                label: "Monthly Earnings",
                data: monthlyEarnings.map((e) => e.amount),
                fill: false,
                borderColor: "rgb(75, 192, 192)",
                tension: 0.1,
            },
        ],
    };

    return (
        <Layout>
            <Head title="Affiliate Dashboard" />

            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Total Earnings
                        </h3>
                        <p className="text-3xl font-bold text-green-600">
                            {formatCurrency(stats.total_earnings)}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Pending Earnings
                        </h3>
                        <p className="text-3xl font-bold text-yellow-600">
                            {formatCurrency(stats.pending_earnings)}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Total Referrals
                        </h3>
                        <p className="text-3xl font-bold text-blue-600">
                            {stats.total_referrals}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Conversion Rate
                        </h3>
                        <p className="text-3xl font-bold text-purple-600">
                            {stats.conversion_rate.toFixed(2)}%
                        </p>
                    </div>
                </div>

                {/* Earnings Chart */}
                <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Earnings History
                    </h3>
                    <div className="h-64">
                        <Line
                            data={earningsData}
                            options={{ maintainAspectRatio: false }}
                        />
                    </div>
                </div>

                {/* Generate Affiliate Links */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">
                        Generate Affiliate Link
                    </h3>
                    <div className="flex space-x-4">
                        <input
                            type="text"
                            placeholder="Enter product URL"
                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                            Generate Link
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
