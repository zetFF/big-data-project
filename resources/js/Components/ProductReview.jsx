import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import StarRating from "@/Components/StarRating";
import { formatDate } from "@/utils";

export default function ProductReview({ product, userHasPurchased }) {
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        rating: 0,
        title: "",
        content: "",
        images: [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("products.reviews.store", product.id), {
            onSuccess: () => {
                setShowForm(false);
                // Show success message
            },
        });
    };

    return (
        <div className="space-y-8">
            {/* Review Summary */}
            <div className="flex items-center space-x-4">
                <div className="flex-1">
                    <div className="flex items-center">
                        <StarRating value={product.average_rating} size="lg" />
                        <span className="ml-2 text-2xl font-bold">
                            {product.average_rating.toFixed(1)}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">
                        Based on {product.total_reviews} reviews
                    </p>
                </div>

                {userHasPurchased && !showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                        Write a Review
                    </button>
                )}
            </div>

            {/* Review Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Rating
                        </label>
                        <StarRating
                            value={data.rating}
                            onChange={(rating) => setData("rating", rating)}
                            editable
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Title
                        </label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData("title", e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Review
                        </label>
                        <textarea
                            value={data.content}
                            onChange={(e) => setData("content", e.target.value)}
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Images (Optional)
                        </label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => setData("images", e.target.files)}
                            className="mt-1 block w-full"
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 border rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        >
                            Submit Review
                        </button>
                    </div>
                </form>
            )}

            {/* Review List */}
            <div className="space-y-6">
                {product.reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <StarRating value={review.rating} />
                                <span className="font-medium">
                                    {review.title}
                                </span>
                            </div>
                            <span className="text-sm text-gray-500">
                                {formatDate(review.created_at)}
                            </span>
                        </div>
                        <p className="mt-2 text-gray-600">{review.content}</p>
                        {review.images.length > 0 && (
                            <div className="mt-4 flex space-x-2">
                                {review.images.map((image) => (
                                    <img
                                        key={image.id}
                                        src={image.url}
                                        alt="Review"
                                        className="h-20 w-20 object-cover rounded-md"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
