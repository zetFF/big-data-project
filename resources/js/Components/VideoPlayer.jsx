import React from "react";

export default function VideoPlayer({ videoUrl, thumbnail }) {
    return (
        <div className="relative aspect-video">
            <video
                className="w-full h-full rounded-lg"
                controls
                poster={thumbnail}
            >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
}
