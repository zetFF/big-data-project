import React from "react";
import { Link } from "@inertiajs/react";

export default function Pagination({ links }) {
    return (
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex justify-between flex-1 sm:hidden">
                {links.prev && (
                    <Link
                        href={links.prev}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Previous
                    </Link>
                )}
                {links.next && (
                    <Link
                        href={links.next}
                        className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Next
                    </Link>
                )}
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        {links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                                    ${
                                        link.active
                                            ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                    }
                                    ${i === 0 ? "rounded-l-md" : ""}
                                    ${
                                        i === links.length - 1
                                            ? "rounded-r-md"
                                            : ""
                                    }
                                `}
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        ))}
                    </nav>
                </div>
            </div>
        </div>
    );
}
