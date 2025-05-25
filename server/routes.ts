import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClipSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { wsManager } from "./websocket";

const createClipRequestSchema = z.object({
  content: z.string().min(1, "Content cannot be empty").max(50000, "Content too large"),
  expiryDuration: z.enum(["2min", "5min", "10min", "1hour", "24hour"]).optional(),
  customExpiry: z.string().optional(),
});

function calculateExpiryDate(expiryDuration?: string, customExpiry?: string): Date {
  const now = new Date();
  
  if (customExpiry) {
    const customDate = new Date(customExpiry);
    if (customDate <= now) {
      throw new Error("Custom expiry must be in the future");
    }
    return customDate;
  }
  
  switch (expiryDuration) {
    case "2min":
      return new Date(now.getTime() + 2 * 60 * 1000);
    case "5min":
      return new Date(now.getTime() + 5 * 60 * 1000);
    case "10min":
      return new Date(now.getTime() + 10 * 60 * 1000);
    case "1hour":
      return new Date(now.getTime() + 60 * 60 * 1000);
    case "24hour":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() + 10 * 60 * 1000); // Default 10 minutes
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a new clip
  app.post("/api/clips", async (req, res) => {
    try {
      const validatedData = createClipRequestSchema.parse(req.body);
      
      const expiresAt = calculateExpiryDate(validatedData.expiryDuration, validatedData.customExpiry);
      
      const clipData = {
        content: validatedData.content,
        expiresAt,
      };
      
      const { id, clip } = await storage.createClip(clipData);
      
      res.json({
        id,
        expiresAt: clip.expiresAt,
        success: true,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({
          success: false,
          message: validationError.message,
        });
      } else {
        res.status(400).json({
          success: false,
          message: error instanceof Error ? error.message : "Invalid request",
        });
      }
    }
  });

  // Get a clip by ID
  app.get("/api/clips/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid clip ID",
        });
      }
      
      const clip = await storage.getClip(id);
      
      if (!clip) {
        return res.status(404).json({
          success: false,
          message: "Clip not found or expired",
        });
      }
      
      res.json({
        success: true,
        content: clip.content,
        expiresAt: clip.expiresAt,
        createdAt: clip.createdAt,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  });

  // Revoke a clip
  app.delete("/api/clips/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid clip ID",
        });
      }
      
      const revoked = await storage.revokeClip(id);
      
      if (!revoked) {
        return res.status(404).json({
          success: false,
          message: "Clip not found",
        });
      }

      // Notify all connected clients that this clip has been revoked
      wsManager.notifyClipRevoked(id);
      
      res.json({
        success: true,
        message: "Clip revoked successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  });

  // Cleanup endpoint (for manual cleanup)
  app.post("/api/cleanup", async (req, res) => {
    try {
      const deletedCount = await storage.cleanupExpiredClips();
      res.json({
        success: true,
        deletedCount,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Cleanup failed",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
