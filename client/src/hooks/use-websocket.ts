import { useEffect, useRef } from "react";

export function useClipInvalidation(clipId: string | null, onClipInvalidated?: () => void) {
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!clipId) return;

    const checkClipStatus = async () => {
      try {
        const response = await fetch(`/api/clips/${clipId}`);
        
        if (!response.ok) {
          // Clip is no longer available (revoked or expired)
          onClipInvalidated?.();
          
          // Stop polling once invalidated
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
        }
      } catch (error) {
        // Network error or server down - clip might be unavailable
        onClipInvalidated?.();
        
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }
    };

    // Check immediately
    checkClipStatus();

    // Then poll every 2 seconds
    pollingRef.current = setInterval(checkClipStatus, 2000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [clipId, onClipInvalidated]);
}