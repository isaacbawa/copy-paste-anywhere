import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import useCountdown from "@/hooks/use-countdown";
import { useClipInvalidation } from "@/hooks/use-websocket";
import StrategicAd from "./strategic-ad";


export default function Footer() {
  return (
    <div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-primary transition-colors">How it Works</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-left max-w-2xl mx-auto">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="material-icons text-sm">shield</span>
                Privacy & Security
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                CopyandPasteAnywhere respects your privacy. We don't store personal information, track users, or keep your text longer than necessary.
                All clips are temporary and automatically deleted after expiry. Links use strong random generation for security.
              </p>
            </div>

            <p className="text-xs text-gray-500">
              © 2024 CopyandPasteAnywhere. Built for simple, secure text sharing across devices.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}