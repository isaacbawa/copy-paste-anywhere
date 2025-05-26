import React from "react";
import { X } from "lucide-react";

export default function PromoBanner() {
    const [visible, setVisible] = React.useState(true);

    if (!visible) return null;

    return (
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl px-4 py-2 shadow-md flex items-center justify-between max-w-md mx-auto mt-4">
            <p className="text-sm font-medium">
                🎉 30% Off all Pro Plans – Limited time!
            </p>
            <a
                href="www.intentora.com#waitlist"
                className="ml-4 bg-black text-white text-sm px-3 py-1.5 rounded-sm hover:bg-gray-800 transition"
            >
                Join
            </a>
            <button onClick={() => setVisible(false)} className="ml-4 hover:text-gray-200">
                <X size={16} />
            </button>
        </div>
    );
}
