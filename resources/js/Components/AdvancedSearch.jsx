import React, { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import debounce from "lodash/debounce";
import { Transition } from "@headlessui/react";

export default function AdvancedSearch({ categories, initialFilters = {} }) {
    const { data, setData, get } = useForm({
        search: initialFilters.search || "",
        category: initialFilters.category || "",
        min_price: initialFilters.min_price || "",
        max_price: initialFilters.max_price || "",
        sort: initialFilters.sort || "relevance",
    });

    const [isOpen, setIsOpen] = useState(false);

    const debouncedSearch = debounce(() => {
        get(route("products.search"), {
            preserveScroll: true,
            preserveState: true,
        });
    }, 300);

    useEffect(() => {
        debouncedSearch();
        return debouncedSearch.cancel;
    }, [data]);

    return (
        <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center space-x-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={data.search}
                        onChange={(e) => setData("search", e.target.value)}
                    />
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                    Filters
                </button>
            </div>

            <Transition
                show={isOpen}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 -translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 -translate-y-1"
            >
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Category
                        </label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={data.category}
                            onChange={(e) =>
                                setData("category", e.target.value)
                            }
                        >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Price Range
                        </label>
                        <div className="mt-1 flex space-x-2">
                            <input
                                type="number"
                                placeholder="Min"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={data.min_price}
                                onChange={(e) =>
                                    setData("min_price", e.target.value)
                                }
                            />
                            <input
                                type="number"
                                placeholder="Max"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={data.max_price}
                                onChange={(e) =>
                                    setData("max_price", e.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Sort By
                        </label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={data.sort}
                            onChange={(e) => setData("sort", e.target.value)}
                        >
                            <option value="relevance">Relevance</option>
                            <option value="price_asc">
                                Price: Low to High
                            </option>
                            <option value="price_desc">
                                Price: High to Low
                            </option>
                            <option value="newest">Newest First</option>
                        </select>
                    </div>
                </div>
            </Transition>
        </div>
    );
}
