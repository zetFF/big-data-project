import React, { useState, useEffect } from "react";

export default function BundleTimer({ endDate }) {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const difference = new Date(endDate) - new Date();

        if (difference <= 0) {
            return {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
            };
        }

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="mt-6">
            <p className="text-sm mb-2">Time Remaining:</p>
            <div className="flex space-x-4">
                <div className="text-center">
                    <div className="bg-black bg-opacity-30 rounded-lg px-3 py-2">
                        <span className="text-2xl font-bold">
                            {timeLeft.days}
                        </span>
                    </div>
                    <p className="text-xs mt-1">Days</p>
                </div>
                <div className="text-center">
                    <div className="bg-black bg-opacity-30 rounded-lg px-3 py-2">
                        <span className="text-2xl font-bold">
                            {timeLeft.hours}
                        </span>
                    </div>
                    <p className="text-xs mt-1">Hours</p>
                </div>
                <div className="text-center">
                    <div className="bg-black bg-opacity-30 rounded-lg px-3 py-2">
                        <span className="text-2xl font-bold">
                            {timeLeft.minutes}
                        </span>
                    </div>
                    <p className="text-xs mt-1">Minutes</p>
                </div>
                <div className="text-center">
                    <div className="bg-black bg-opacity-30 rounded-lg px-3 py-2">
                        <span className="text-2xl font-bold">
                            {timeLeft.seconds}
                        </span>
                    </div>
                    <p className="text-xs mt-1">Seconds</p>
                </div>
            </div>
        </div>
    );
}
