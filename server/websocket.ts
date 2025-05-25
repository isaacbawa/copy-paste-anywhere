import { WebSocketServer } from "ws";
import { Server } from "http";

interface ClientConnection {
  ws: any;
  clipId: string;
}

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, ClientConnection[]> = new Map();

  setup(server: Server) {
    this.wss = new WebSocketServer({ server, path: "/ws" });

    this.wss.on("connection", (ws, req) => {
      const url = new URL(req.url!, `http://${req.headers.host}`);
      const clipId = url.searchParams.get("clipId");
      
      if (!clipId) {
        ws.close(1008, "Missing clipId");
        return;
      }

      // Add client to the map
      if (!this.clients.has(clipId)) {
        this.clients.set(clipId, []);
      }
      
      const client: ClientConnection = { ws, clipId };
      this.clients.get(clipId)!.push(client);

      console.log(`Client connected for clip: ${clipId}`);

      ws.on("close", () => {
        this.removeClient(clipId, client);
        console.log(`Client disconnected for clip: ${clipId}`);
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
        this.removeClient(clipId, client);
      });

      // Send ping every 30 seconds to keep connection alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === ws.OPEN) {
          ws.ping();
        } else {
          clearInterval(pingInterval);
        }
      }, 30000);

      ws.on("close", () => {
        clearInterval(pingInterval);
      });
    });
  }

  private removeClient(clipId: string, client: ClientConnection) {
    const clients = this.clients.get(clipId);
    if (clients) {
      const index = clients.indexOf(client);
      if (index > -1) {
        clients.splice(index, 1);
      }
      if (clients.length === 0) {
        this.clients.delete(clipId);
      }
    }
  }

  notifyClipRevoked(clipId: string) {
    const clients = this.clients.get(clipId);
    if (clients) {
      clients.forEach(client => {
        if (client.ws.readyState === client.ws.OPEN) {
          client.ws.send(JSON.stringify({
            type: "clip_revoked",
            clipId
          }));
        }
      });
      // Clean up connections for this clip
      this.clients.delete(clipId);
    }
  }

  notifyClipExpired(clipId: string) {
    const clients = this.clients.get(clipId);
    if (clients) {
      clients.forEach(client => {
        if (client.ws.readyState === client.ws.OPEN) {
          client.ws.send(JSON.stringify({
            type: "clip_expired",
            clipId
          }));
        }
      });
      // Clean up connections for this clip
      this.clients.delete(clipId);
    }
  }
}

export const wsManager = new WebSocketManager();

export function setupWebSocket(server: Server) {
  wsManager.setup(server);
}