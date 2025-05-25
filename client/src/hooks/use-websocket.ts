import { useEffect, useRef, useState } from "react";

interface WebSocketMessage {
  type: "clip_revoked" | "clip_expired" | "connection_established";
  clipId: string;
  connectionId?: string;
  timestamp?: string;
}

export function useWebSocket(clipId: string | null, onClipInvalidated?: () => void) {
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected");
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!clipId) return;

    const connect = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws?clipId=${clipId}`;
        
        wsRef.current = new WebSocket(wsUrl);
        setConnectionStatus("connecting");

        wsRef.current.onopen = () => {
          setConnectionStatus("connected");
          console.log("WebSocket connected for clip:", clipId);
        };

        wsRef.current.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            console.log("Received WebSocket message:", message);
            
            if (message.type === "connection_established") {
              console.log(`WebSocket connection established for clip ${message.clipId}`);
            } else if (message.type === "clip_revoked" || message.type === "clip_expired") {
              console.log(`Clip ${message.type}:`, message.clipId, "at", message.timestamp);
              onClipInvalidated?.();
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        wsRef.current.onclose = () => {
          setConnectionStatus("disconnected");
          console.log("WebSocket disconnected for clip:", clipId);
          
          // Auto-reconnect after 3 seconds
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (clipId) {
              connect();
            }
          }, 3000);
        };

        wsRef.current.onerror = (error) => {
          console.error("WebSocket error:", error);
          setConnectionStatus("disconnected");
        };

      } catch (error) {
        console.error("Error creating WebSocket connection:", error);
        setConnectionStatus("disconnected");
      }
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [clipId, onClipInvalidated]);

  return connectionStatus;
}