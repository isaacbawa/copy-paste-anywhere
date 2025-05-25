import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import useCountdown from "@/hooks/use-countdown";

interface SuccessViewProps {
  clipId: string;
  expiresAt: string;
  onCreateNew: () => void;
}

export default function SuccessView({ clipId, expiresAt, onCreateNew }: SuccessViewProps) {
  const [isRevoked, setIsRevoked] = useState(false);
  const { toast } = useToast();
  const timeRemaining = useCountdown(new Date(expiresAt));
  
  const generatedLink = `${window.location.origin}/clip/${clipId}`;

  const revokeClipMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/clips/${clipId}`);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setIsRevoked(true);
        toast({
          title: "Success",
          description: "Clip revoked successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to revoke clip",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to revoke clip",
        variant: "destructive",
      });
    },
  });

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink).then(() => {
      toast({
        title: "Success",
        description: "Link copied to clipboard!",
      });
    }).catch(() => {
      toast({
        title: "Error",
        description: "Failed to copy. Please copy manually.",
        variant: "destructive",
      });
    });
  };

  const handleRevokeClip = () => {
    if (window.confirm('Are you sure you want to revoke this clip? It will no longer be accessible.')) {
      revokeClipMutation.mutate();
    }
  };

  if (isRevoked) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-icons text-green-500 text-2xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Clip Revoked</h2>
          <p className="text-gray-600">The clip has been successfully revoked and is no longer accessible.</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center">
          <Button 
            onClick={onCreateNew}
            className="bg-primary hover:bg-blue-700 text-white py-3 px-6 transition-all flex items-center justify-center gap-2 mx-auto"
          >
            <span className="material-icons text-sm">add</span>
            Create New Clip
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-icons text-green-500 text-2xl">check_circle</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Clip Created Successfully!</h2>
        <p className="text-gray-600">Your text is now accessible via the private link below</p>
      </div>

      {/* Link Display Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Private Link</label>
            <div className="flex gap-2">
              <Input 
                type="text" 
                value={generatedLink}
                readOnly
                className="flex-1 bg-gray-50 font-mono text-sm"
              />
              <Button 
                onClick={copyLink}
                className="bg-primary hover:bg-blue-700 text-white px-4 py-3 transition-all flex items-center gap-2"
              >
                <span className="material-icons text-sm">content_copy</span>
                <span className="hidden sm:inline">Copy</span>
              </Button>
            </div>
          </div>

          {/* Expiry Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-icons text-sm">schedule</span>
              <span className="text-sm font-medium">Expires in: <span>{timeRemaining}</span></span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={onCreateNew}
              variant="secondary"
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-icons text-sm">add</span>
              Create New Clip
            </Button>
            <Button 
              onClick={handleRevokeClip}
              disabled={revokeClipMutation.isPending}
              variant="destructive"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 transition-all flex items-center justify-center gap-2"
            >
              {revokeClipMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <span className="material-icons text-sm">block</span>
                  Revoke Clip
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
