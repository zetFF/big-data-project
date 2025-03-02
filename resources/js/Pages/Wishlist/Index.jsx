import React from "react";
import { Head } from "@inertiajs/react";
import Layout from "@/Layouts/Layout";
import WishlistItem from "@/Components/Wishlist/WishlistItem";

export default function Index({ wishlist }) {
    return (
        <Layout>
            <Head title="My Wishlist" />

            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

                {wishlist.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlist.map((item) => (
                            <WishlistItem key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Your wishlist is empty</p>
                    </div>
                )}
            </div>
        </Layout>
    );
}
