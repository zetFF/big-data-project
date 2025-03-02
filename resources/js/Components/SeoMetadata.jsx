import React from "react";
import { Head } from "@inertiajs/react";

export default function SeoMetadata({ metadata, structuredData }) {
    return (
        <Head>
            <title>{metadata.title}</title>
            <meta name="description" content={metadata.description} />
            <meta name="keywords" content={metadata.keywords} />

            {/* Open Graph */}
            <meta property="og:title" content={metadata["og:title"]} />
            <meta
                property="og:description"
                content={metadata["og:description"]}
            />
            <meta property="og:image" content={metadata["og:image"]} />
            <meta property="og:type" content={metadata["og:type"]} />

            {/* Twitter Card */}
            <meta name="twitter:card" content={metadata["twitter:card"]} />
            <meta name="twitter:title" content={metadata["twitter:title"]} />
            <meta
                name="twitter:description"
                content={metadata["twitter:description"]}
            />
            <meta name="twitter:image" content={metadata["twitter:image"]} />

            {/* Product Metadata */}
            {metadata["og:type"] === "product" && (
                <>
                    <meta
                        property="product:price:amount"
                        content={metadata["product:price:amount"]}
                    />
                    <meta
                        property="product:price:currency"
                        content={metadata["product:price:currency"]}
                    />
                </>
            )}

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Head>
    );
}
