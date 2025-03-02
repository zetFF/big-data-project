import React, { useState, useEffect } from "react";

export default function CountdownTimer({ endTime }) {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const difference = new Date(endTime) - new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }

        return timeLeft;
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime]);

    return (
        <div className="flex space-x-2">
            {Object.keys(timeLeft).length > 0 ? (
                <>
                    <div className="text-xl font-bold">
                        {timeLeft.days}d : {timeLeft.hours}h :{" "}
                        {timeLeft.minutes}m : {timeLeft.seconds}s
                    </div>
                </>
            ) : (
                <div className="text-xl font-bold text-red-600">
                    Flash Sale Ended
                </div>
            )}
        </div>
    );
}
