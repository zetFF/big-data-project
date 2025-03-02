import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import StarRating from "./StarRating";
import ImageUpload from "./ImageUpload";

export default function ReviewForm({ product }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        rating: 0,
        comment: "",
        images: [],
    });

    const [preview, setPreview] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("rating", data.rating);
        formData.append("comment", data.comment);
        data.images.forEach((image) => {
            formData.append("images[]", image);
        });

        post(route("products.reviews.store", product.id), {
            data: formData,
            onSuccess: () => {
                reset();
                setPreview([]);
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Rating
                </label>
                <StarRating
                    value={data.rating}
                    onChange={(rating) => setData("rating", rating)}
                />
                {errors.rating && (
                    <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Your Review
                </label>
                <textarea
                    value={data.comment}
                    onChange={(e) => setData("comment", e.target.value)}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                {errors.comment && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.comment}
                    </p>
                )}
            </div>

            <ImageUpload
                preview={preview}
                setPreview={setPreview}
                onChange={(files) => setData("images", files)}
            />

            <button
                type="submit"
                disabled={processing}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
                Submit Review
            </button>
        </form>
    );
}
