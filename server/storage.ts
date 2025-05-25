import { clips, type Clip, type InsertClip } from "@shared/schema";
import { nanoid } from "nanoid";
import { wsManager } from "./websocket";

export interface IStorage {
  createClip(clip: InsertClip): Promise<{ id: string; clip: Clip }>;
  getClip(id: string): Promise<Clip | undefined>;
  revokeClip(id: string): Promise<boolean>;
  cleanupExpiredClips(): Promise<number>;
}

export class MemStorage implements IStorage {
  private clips: Map<string, Clip>;

  constructor() {
    this.clips = new Map();
    // Start cleanup interval (every 5 minutes)
    setInterval(() => {
      this.cleanupExpiredClips();
    }, 5 * 60 * 1000);
  }

  async createClip(insertClip: InsertClip): Promise<{ id: string; clip: Clip }> {
    // Generate strong random ID (24 characters)
    const id = nanoid(24);
    
    const clip: Clip = {
      id,
      content: insertClip.content,
      expiresAt: insertClip.expiresAt,
      isRevoked: "false",
      createdAt: new Date(),
    };
    
    this.clips.set(id, clip);
    return { id, clip };
  }

  async getClip(id: string): Promise<Clip | undefined> {
    const clip = this.clips.get(id);
    
    if (!clip) {
      return undefined;
    }
    
    // Check if clip is expired
    if (new Date() > clip.expiresAt) {
      this.clips.delete(id);
      return undefined;
    }
    
    // Check if clip is revoked
    if (clip.isRevoked === "true") {
      return undefined;
    }
    
    return clip;
  }

  async revokeClip(id: string): Promise<boolean> {
    const clip = this.clips.get(id);
    
    if (!clip) {
      return false;
    }
    
    // Mark as revoked instead of deleting
    const revokedClip: Clip = {
      ...clip,
      isRevoked: "true",
    };
    
    this.clips.set(id, revokedClip);
    return true;
  }

  async cleanupExpiredClips(): Promise<number> {
    const now = new Date();
    let deletedCount = 0;
    
    const expiredIds: string[] = [];
    
    // Check for expired clips
    for (const [id, clip] of Array.from(this.clips.entries())) {
      if (now > clip.expiresAt) {
        expiredIds.push(id);
      }
    }
    
    // Remove expired clips and notify clients
    expiredIds.forEach(id => {
      this.clips.delete(id);
      deletedCount++;
      // Notify all connected clients that this clip has expired
      wsManager.notifyClipExpired(id);
    });
    
    return deletedCount;
  }
}

export const storage = new MemStorage();
