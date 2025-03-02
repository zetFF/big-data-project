import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import Layout from "@/Layouts/Layout";
import VideoPlayer from "@/Components/VideoPlayer";
import { useForm } from "@inertiajs/react";

export default function VideoIndex({ product, videos }) {
    const [selectedVideo, setSelectedVideo] = useState(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        title: "",
        description: "",
        video: null,
        thumbnail: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("products.video-reviews.store", product.id), {
            onSuccess: () => {
                reset();
                document.getElementById("videoUpload").value = "";
                document.getElementById("thumbnailUpload").value = "";
            },
        });
    };

    return (
        <Layout>
            <Head title={`Video Reviews - ${product.name}`} />

            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        {selectedVideo ? (
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                                <VideoPlayer
                                    url={selectedVideo.video_url}
                                    onEnded={() =>
                                        selectedVideo.incrementViews()
                                    }
                                />
                                <div className="p-4">
                                    <h2 className="text-xl font-bold">
                                        {selectedVideo.title}
                                    </h2>
                                    <p className="text-gray-600 mt-2">
                                        {selectedVideo.description}
                                    </p>
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center space-x-4">
                                            <button
                                                onClick={() =>
                                                    selectedVideo.toggleLike()
                                                }
                                                className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
                                            >
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                                </svg>
                                                <span>
                                                    {selectedVideo.likes_count}
                                                </span>
                                            </button>
                                            <span className="text-gray-600">
                                                {selectedVideo.views_count}{" "}
                                                views
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Posted by {selectedVideo.user.name}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-100 rounded-lg p-12 text-center">
                                <p className="text-gray-600">
                                    Select a video to watch
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-4">
                                Upload Your Review
                            </h3>
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Title"
                                        value={data.title}
                                        onChange={(e) =>
                                            setData("title", e.target.value)
                                        }
                                        className="w-full rounded-md shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    />
                                    <textarea
                                        placeholder="Description"
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                "description",
                                                e.target.value
                                            )
                                        }
                                        rows="3"
                                        className="w-full rounded-md shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    ></textarea>
                                    <input
                                        id="videoUpload"
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) =>
                                            setData("video", e.target.files[0])
                                        }
                                        className="w-full"
                                    />
                                    <input
                                        id="thumbnailUpload"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            setData(
                                                "thumbnail",
                                                e.target.files[0]
                                            )
                                        }
                                        className="w-full"
                                    />
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        Upload Review
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="p-4 border-b">
                                <h3 className="font-semibold">All Reviews</h3>
                            </div>
                            <div className="divide-y">
                                {videos.map((video) => (
                                    <div
                                        key={video.id}
                                        onClick={() => setSelectedVideo(video)}
                                        className="p-4 hover:bg-gray-50 cursor-pointer"
                                    >
                                        <div className="flex space-x-4">
                                            <img
                                                src={video.thumbnail_url}
                                                alt={video.title}
                                                className="w-32 h-24 object-cover rounded"
                                            />
                                            <div>
                                                <h4 className="font-medium">
                                                    {video.title}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    {video.views_count} views •{" "}
                                                    {video.likes_count} likes
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
