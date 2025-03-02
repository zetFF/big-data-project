import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function DateRangePicker({ startDate, endDate, onChange }) {
    return (
        <div className="flex items-center space-x-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Start Date
                </label>
                <DatePicker
                    selected={startDate}
                    onChange={(date) => onChange({ startDate: date, endDate })}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    End Date
                </label>
                <DatePicker
                    selected={endDate}
                    onChange={(date) => onChange({ startDate, endDate: date })}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
            </div>
        </div>
    );
}
