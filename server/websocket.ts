import { WebSocketServer } from "ws";
import { Server } from "http";

interface ClientConnection {
  ws: any;
  clipId: string;
  connectionId: string;
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
        console.log("WebSocket connection rejected: Missing clipId");
        ws.close(1008, "Missing clipId");
        return;
      }

      // Add client to the map
      if (!this.clients.has(clipId)) {
        this.clients.set(clipId, []);
      }
      
      const connectionId = Math.random().toString(36).substring(7);
      const client: ClientConnection = { ws, clipId, connectionId };
      this.clients.get(clipId)!.push(client);

      console.log(`✅ WebSocket client connected for clip: ${clipId} (${connectionId})`);
      console.log(`📊 Total clients for clip ${clipId}: ${this.clients.get(clipId)!.length}`);

      // Send initial connection confirmation immediately
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({
          type: "connection_established",
          clipId,
          connectionId,
          timestamp: new Date().toISOString()
        }));
        console.log(`📤 Sent connection confirmation to ${connectionId}`);
      }

      ws.on("close", () => {
        this.removeClient(clipId, client);
        console.log(`❌ WebSocket client disconnected for clip: ${clipId} (${connectionId})`);
      });

      ws.on("error", (error) => {
        console.error("🚨 WebSocket error:", error);
        this.removeClient(clipId, client);
      });

      ws.on("pong", () => {
        console.log(`💓 Pong received from ${connectionId}`);
      });

      // Send ping every 30 seconds to keep connection alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === ws.OPEN) {
          ws.ping();
          console.log(`📡 Ping sent to ${connectionId}`);
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
    console.log(`Notifying clients that clip ${clipId} was revoked`);
    const clients = this.clients.get(clipId);
    if (clients && clients.length > 0) {
      console.log(`Found ${clients.length} connected clients for clip ${clipId}`);
      clients.forEach(client => {
        if (client.ws.readyState === client.ws.OPEN) {
          console.log(`Sending revoke notification to client ${client.connectionId}`);
          client.ws.send(JSON.stringify({
            type: "clip_revoked",
            clipId,
            timestamp: new Date().toISOString()
          }));
        } else {
          console.log(`Client ${client.connectionId} connection is not open`);
        }
      });
      // Clean up connections for this clip
      this.clients.delete(clipId);
    } else {
      console.log(`No clients found for clip ${clipId}`);
    }
  }

  notifyClipExpired(clipId: string) {
    console.log(`Notifying clients that clip ${clipId} expired`);
    const clients = this.clients.get(clipId);
    if (clients && clients.length > 0) {
      console.log(`Found ${clients.length} connected clients for clip ${clipId}`);
      clients.forEach(client => {
        if (client.ws.readyState === client.ws.OPEN) {
          console.log(`Sending expiry notification to client ${client.connectionId}`);
          client.ws.send(JSON.stringify({
            type: "clip_expired",
            clipId,
            timestamp: new Date().toISOString()
          }));
        } else {
          console.log(`Client ${client.connectionId} connection is not open`);
        }
      });
      // Clean up connections for this clip
      this.clients.delete(clipId);
    } else {
      console.log(`No clients found for clip ${clipId}`);
    }
  }
}

export const wsManager = new WebSocketManager();

export function setupWebSocket(server: Server) {
  wsManager.setup(server);
}