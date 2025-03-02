import React, { useState } from "react";

export default function FileUpload({
    onFileSelect,
    accept = ".jpg,.jpeg,.png,.pdf",
}) {
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
                dragActive
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-300"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <input
                type="file"
                className="hidden"
                accept={accept}
                onChange={handleChange}
                id="file-upload"
            />
            <label
                htmlFor="file-upload"
                className="cursor-pointer text-indigo-600 hover:text-indigo-800"
            >
                <span>Click to upload</span>
                <span className="text-gray-600"> or drag and drop</span>
            </label>
            <p className="text-sm text-gray-500 mt-2">
                Supported files: {accept.replace(/\./g, "").toUpperCase()}
            </p>
        </div>
    );
}
