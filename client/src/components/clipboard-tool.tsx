import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import SuccessView from "./success-view";
import StrategicAd from "./strategic-ad";
import PromoBanner from "./nonintrusiveAds/promobanner";
import AppInstallBanner from "./nonintrusiveAds/promo-2";

type ExpiryDuration = "2min" | "5min" | "10min" | "1hour" | "24hour" | "custom";

export default function ClipboardTool() {
  const [clipText, setClipText] = useState("");
  const [expiryDuration, setExpiryDuration] = useState<ExpiryDuration>("10min");
  const [customExpiry, setCustomExpiry] = useState("");
  const [generatedClip, setGeneratedClip] = useState<{ id: string; expiresAt: string } | null>(null);
  const { toast } = useToast();

  const createClipMutation = useMutation({
    mutationFn: async (data: { content: string; expiryDuration?: string; customExpiry?: string }) => {
      const response = await apiRequest("POST", "/api/clips", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setGeneratedClip({ id: data.id, expiresAt: data.expiresAt });
        toast({
          title: "Success",
          description: "Clip created successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create clip",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create clip",
        variant: "destructive",
      });
    },
  });

  const handleGenerateLink = () => {
    if (!clipText.trim()) return;

    const data: any = {
      content: clipText.trim(),
    };

    if (expiryDuration === "custom") {
      if (!customExpiry) {
        toast({
          title: "Error",
          description: "Please select a custom expiry time",
          variant: "destructive",
        });
        return;
      }
      data.customExpiry = customExpiry;
    } else {
      data.expiryDuration = expiryDuration;
    }

    createClipMutation.mutate(data);
  };

  const handleCreateNewClip = () => {
    setGeneratedClip(null);
    setClipText("");
    setExpiryDuration("10min");
    setCustomExpiry("");
  };

  if (generatedClip) {
    return (
      <div className="space-y-6">
        <SuccessView
          clipId={generatedClip.id}
          expiresAt={generatedClip.expiresAt}
          onCreateNew={handleCreateNewClip}
        />


        {/* Strategic Ad Placement 2 */}
        {/* <StrategicAd
          title="Strategic Product Showcase Area #2"
          subtitle="Complementary tools or services"
        /> */}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Share Text Instantly Across Devices</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Copy text on one device, get a private link, and paste it anywhere else.
          No signup required. Secure, completely private and free.
        </p>
      </div>

      <PromoBanner />

      {/* Strategic Ad Placement 1
      <StrategicAd
        title="Strategic Product Showcase Area #1"
        subtitle="Non-intrusive promotional content placeholder"
      /> */}

      {/* Main Input Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="space-y-4">
          {/* Text Input Area */}
          <div>
            <Label htmlFor="clipText" className="block text-sm font-medium text-gray-700 mb-2">
              Enter or paste your text
            </Label>
            <Textarea
              id="clipText"
              value={clipText}
              onChange={(e) => setClipText(e.target.value)}
              placeholder="Type or paste the text you want to share..."
              className="w-full h-40 resize-none"
            />
            <div className="text-xs text-gray-500 mt-1 flex items-center">
              <span className="material-icons text-sm mr-1">info</span>
              <span>{clipText.length}</span> characters
            </div>
          </div>

          {/* Expiry Selection */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="expirySelect" className="block text-sm font-medium text-gray-700 mb-2">
                Clip expires in
              </Label>
              <Select value={expiryDuration} onValueChange={(value: ExpiryDuration) => setExpiryDuration(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2min">2 minutes</SelectItem>
                  <SelectItem value="5min">5 minutes</SelectItem>
                  <SelectItem value="10min">10 minutes</SelectItem>
                  <SelectItem value="1hour">1 hour</SelectItem>
                  <SelectItem value="24hour">24 hours</SelectItem>
                  <SelectItem value="custom">Custom duration</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Duration Input */}
            {expiryDuration === "custom" && (
              <div className="flex-1">
                <Label htmlFor="customTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Custom expiry
                </Label>
                <Input
                  type="datetime-local"
                  id="customTime"
                  value={customExpiry}
                  onChange={(e) => setCustomExpiry(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            )}
          </div>

          {/* Generate Link Button */}
          <div className="text-center mb-8">
            <Button
              onClick={handleGenerateLink}
              disabled={!clipText.trim() || createClipMutation.isPending}
              className="bg-primary hover:bg-blue-700 text-white font-medium py-3 px-6 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {createClipMutation.isPending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <span className="material-icons">link</span>
                  <span>Generate Private Link</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
