import React from "react";
import { useForm } from "@inertiajs/react";
import Select from "@/Components/Select";
import Input from "@/Components/Input";

export default function ProductFilter({ categories, vendors }) {
    const { data, setData, get, processing } = useForm({
        search: "",
        category: "",
        price_min: "",
        price_max: "",
        vendor: "",
        sort: "created_at,desc",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        get(route("products.index"), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const sortOptions = [
        { value: "created_at,desc", label: "Newest" },
        { value: "created_at,asc", label: "Oldest" },
        { value: "price,asc", label: "Price: Low to High" },
        { value: "price,desc", label: "Price: High to Low" },
    ];

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-white p-4 rounded-lg shadow"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input
                    type="text"
                    placeholder="Search products..."
                    value={data.search}
                    onChange={(e) => setData("search", e.target.value)}
                />

                <Select
                    value={data.category}
                    onChange={(e) => setData("category", e.target.value)}
                    options={[
                        { value: "", label: "All Categories" },
                        ...categories.map((c) => ({
                            value: c.id,
                            label: c.name,
                        })),
                    ]}
                />

                <Select
                    value={data.vendor}
                    onChange={(e) => setData("vendor", e.target.value)}
                    options={[
                        { value: "", label: "All Vendors" },
                        ...vendors.map((v) => ({
                            value: v.id,
                            label: v.shop_name,
                        })),
                    ]}
                />

                <div className="flex space-x-2">
                    <Input
                        type="number"
                        placeholder="Min Price"
                        value={data.price_min}
                        onChange={(e) => setData("price_min", e.target.value)}
                    />
                    <Input
                        type="number"
                        placeholder="Max Price"
                        value={data.price_max}
                        onChange={(e) => setData("price_max", e.target.value)}
                    />
                </div>

                <Select
                    value={data.sort}
                    onChange={(e) => setData("sort", e.target.value)}
                    options={sortOptions}
                />

                <button
                    type="submit"
                    disabled={processing}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    Apply Filters
                </button>
            </div>
        </form>
    );
}
