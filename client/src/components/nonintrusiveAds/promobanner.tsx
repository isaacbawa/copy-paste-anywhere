
import { X } from "lucide-react";
import React from "react";
import "./PromoBanner.css" // Keyframes defined here

export default function PromoBanner() {
    // const [visible, setVisible] = React.useState(true);
    return (
        <div className="promo-shake bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl px-4 py-3 shadow-md mx-4 sm:mx-auto sm:max-w-xl mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm sm:text-base text-center sm:text-left">
                🚀 Be the first to experience Intentoral.
            </p>
            <a
                href="https://intentora.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-blue-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-100 transition text-center"
            >
                Join Waitlist
            </a>

            {/* Optional button to close the banner */}
            {/* <button onClick={() => setVisible(false)} className="ml-4 hover:text-gray-200">
                <X size={16} />
            </button> */}

        </div>
    );
}




