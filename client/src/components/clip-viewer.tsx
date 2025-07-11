import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import useCountdown from "@/hooks/use-countdown";
import { useClipInvalidation } from "@/hooks/use-websocket";
import StrategicAd from "./strategic-ad";
import Footer from "./footer";
import PromoBanner from "./nonintrusiveAds/promobanner";

interface ClipViewerProps {
  clip: {
    content: string;
    expiresAt: string;
    createdAt: string;
  };
}

export default function ClipViewer({ clip }: ClipViewerProps) {
  const [isClipInvalidated, setIsClipInvalidated] = useState(false);
  const { toast } = useToast();
  const timeRemaining = useCountdown(new Date(clip.expiresAt));

  // Extract clip ID from current URL
  const clipId = window.location.pathname.split('/clip/')[1];

  // Set up real-time clip invalidation checking
  useClipInvalidation(clipId, () => {
    setIsClipInvalidated(true);
  });

  const copyToClipboard = () => {
    if (isClipInvalidated) {
      // Don't show any popup - the page already shows the clip is unavailable
      return;
    }

    navigator.clipboard.writeText(clip.content).then(() => {
      toast({
        title: "Success",
        description: "Text copied to clipboard!",
      });
    }).catch(() => {
      toast({
        title: "Error",
        description: "Failed to copy. Please copy manually.",
        variant: "destructive",
      });
    });
  };

  const goToCreate = () => {
    window.location.href = "/";
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            <span className="text-primary">Copy</span>and<span className="text-primary">Paste</span>Anywhere
          </h1>
          <p className="text-sm text-gray-600 mt-1">Universal clipboard for instant text sharing</p>
        </div>
      </header>
      <PromoBanner />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Shared Text Clip</h2>
            <p className="text-gray-600">Someone shared this text with you</p>
          </div>

          {/* Clip Content Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="space-y-4">
              {/* Clip Text Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shared Content</label>
                {isClipInvalidated ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 min-h-40 flex items-center justify-center">
                    <div className="text-center text-red-600 max-w-md">
                      <span className="material-icons text-4xl mb-3 block">block</span>
                      <p className="font-semibold text-lg mb-2">This clip is no longer available</p>
                      <p className="text-sm mb-4">It has been revoked by the owner or has expired</p>

                      <div className="space-y-2 text-sm text-gray-600">
                        <p>• Contact the owner for a new link</p>
                        <p>• Create your own clip for free below</p>
                        <p>• All clips are temporary and secure</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-40">
                    <pre className="whitespace-pre-wrap font-sans text-gray-900">{clip.content}</pre>
                  </div>
                )}
              </div>

              {/* Copy Button */}
              <Button
                onClick={copyToClipboard}
                disabled={isClipInvalidated}
                className="w-full bg-primary hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-icons">content_copy</span>
                {isClipInvalidated ? "Clip Not Available" : "Copy Text to Clipboard"}
              </Button>

              {/* Expiry Info */}
              {!isClipInvalidated && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-amber-700">
                    <span className="material-icons text-sm">schedule</span>
                    <span className="text-sm">This clip expires in: <span>{timeRemaining}</span></span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Create Your Own Clip */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Need to share text too?</h3>
            <p className="text-gray-600 text-sm mb-3">Create your own secure, temporary clip for free</p>
            <Button
              onClick={goToCreate}
              className="bg-primary hover:bg-blue-700 text-white py-2 px-4 transition-all text-sm"
            >
              Create New Clip For Free
            </Button>
          </div>
          <PromoBanner />
          {/* Strategic Ad Placement */}
          {/* <StrategicAd
            title="Strategic Product Showcase Area"
            subtitle="Complementary tools for productivity"
          /> */}
        </div>
      </main>

      {/* <Footer /> */}
    </div>
  );
}
