import React from "react";
import { Link } from "@inertiajs/react";
import Navigation from "@/Components/Navigation";
import Footer from "@/Components/Footer";

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-gray-100">
            <Navigation />

            <main>{children}</main>

            <Footer />
        </div>
    );
}
