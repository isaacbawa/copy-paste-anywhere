import React from "react";

export default function AppInstallBanner() {
    return (
        <div className="fixed bottom-4 left-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between sm:max-w-md sm:mx-auto sm:left-1/2 sm:-translate-x-1/2">
            <div className="text-sm">
                📱 Install our app for faster access!
            </div>
            <a
                href="#"
                className="ml-4 text-sm bg-white text-gray-900 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition"
            >
                Install
            </a>
        </div>
    );
}
