import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import StarRating from "./StarRating";

export default function DetailedReview({ review, onVoteHelpful }) {
    const [showResponse, setShowResponse] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        response: "",
    });

    const handleSubmitResponse = (e) => {
        e.preventDefault();
        post(route("reviews.respond", review.id), {
            onSuccess: () => {
                reset();
                setShowResponse(false);
            },
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold">{review.title}</h3>
                    <StarRating value={review.rating} readonly />
                </div>
                {review.verified_purchase && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Verified Purchase
                    </span>
                )}
            </div>

            <p className="text-gray-700 mb-4">{review.comment}</p>

            {(review.pros?.length > 0 || review.cons?.length > 0) && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <h4 className="font-medium text-green-600 mb-2">
                            Pros
                        </h4>
                        <ul className="list-disc list-inside text-sm">
                            {review.pros?.map((pro, index) => (
                                <li key={index}>{pro}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium text-red-600 mb-2">Cons</h4>
                        <ul className="list-disc list-inside text-sm">
                            {review.cons?.map((con, index) => (
                                <li key={index}>{con}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {review.images?.length > 0 && (
                <div className="flex space-x-2 mb-4">
                    {review.images.map((image) => (
                        <img
                            key={image.id}
                            src={image.url}
                            alt="Review"
                            className="w-20 h-20 object-cover rounded"
                        />
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => onVoteHelpful(review.id)}
                        className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                    >
                        <span>Helpful ({review.helpful_count})</span>
                    </button>
                    <button
                        onClick={() => setShowResponse(!showResponse)}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        Response ({review.responses?.length || 0})
                    </button>
                </div>
                <span>{new Date(review.created_at).toLocaleDateString()}</span>
            </div>

            {showResponse && (
                <div className="mt-4">
                    <form onSubmit={handleSubmitResponse}>
                        <textarea
                            value={data.response}
                            onChange={(e) =>
                                setData("response", e.target.value)
                            }
                            className="w-full rounded-md shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            rows="3"
                            placeholder="Write a response..."
                        ></textarea>
                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                            Submit Response
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
