import React, { useEffect, useRef } from "react";
import { Head } from "@inertiajs/react";
import Layout from "@/Layouts/Layout";
import { useForm } from "@inertiajs/react";

export default function Show({ chat }) {
    const messagesEndRef = useRef(null);
    const { data, setData, post, processing, reset } = useForm({
        content: "",
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();

        // Listen for new messages
        Echo.private(`chat.${chat.id}`).listen("NewChatMessage", (e) => {
            chat.messages.push(e.message);
            scrollToBottom();
        });
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("chats.messages.store", chat.id), {
            onSuccess: () => {
                reset("content");
                scrollToBottom();
            },
        });
    };

    return (
        <Layout>
            <Head title="Chat" />

            <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-4 border-b">
                        <div className="flex items-center">
                            <img
                                src={chat.vendor.avatar}
                                alt={chat.vendor.name}
                                className="h-10 w-10 rounded-full"
                            />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">
                                    {chat.vendor.name}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="h-96 overflow-y-auto p-4">
                        {chat.messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${
                                    message.user_id === auth.user.id
                                        ? "justify-end"
                                        : "justify-start"
                                } mb-4`}
                            >
                                <div
                                    className={`rounded-lg px-4 py-2 max-w-xs ${
                                        message.user_id === auth.user.id
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-100"
                                    }`}
                                >
                                    <p className="text-sm">{message.content}</p>
                                    <p className="text-xs mt-1 opacity-75">
                                        {new Date(
                                            message.created_at
                                        ).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 border-t">
                        <form onSubmit={handleSubmit}>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={data.content}
                                    onChange={(e) =>
                                        setData("content", e.target.value)
                                    }
                                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                    placeholder="Type your message..."
                                />
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                                >
                                    Send
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
