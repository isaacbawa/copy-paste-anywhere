import React from "react";

export default function NewsletterBanner() {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm max-w-lg mx-auto mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-800">
                📬 Stay updated! <span className="font-medium">Join our newsletter</span> for tips & updates.
            </div>
            <a
                href="intentora.com#waitlist"
                className="ml-4 bg-black text-white text-sm px-3 py-1.5 rounded-xl hover:bg-gray-800 transition"
            >
                Subscribe
            </a>
        </div>
    );
}
