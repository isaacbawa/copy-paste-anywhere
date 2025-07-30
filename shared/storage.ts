import { nanoid } from "nanoid";
import type { InsertClip, Clip } from "./schema";

// Serverless-compatible storage implementation with smart cleanup
class MemStorage {
    private clips: Map<string, Clip>;
    private lastCleanup: number;
    private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

    constructor() {
        this.clips = new Map();
        this.lastCleanup = Date.now();
        
        // In development with persistent process, use background cleanup for better performance
        if (this.isDevelopment()) {
            setInterval(() => this.cleanupExpiredClips(), this.CLEANUP_INTERVAL);
        }
        // In production (serverless), cleanup happens automatically on-demand
    }

    private isDevelopment(): boolean {
        return typeof process !== 'undefined' && 
               (process.env.NODE_ENV === 'development' || 
                process.env.VERCEL_ENV === undefined);
    }

    private shouldCleanup(): boolean {
        // In development with background cleanup, less frequent on-demand cleanup
        if (this.isDevelopment()) {
            return Date.now() - this.lastCleanup > this.CLEANUP_INTERVAL * 2;
        }
        // In production, cleanup more frequently (every 2 minutes of activity)
        return Date.now() - this.lastCleanup > 2 * 60 * 1000;
    }

    private performLazyCleanup(): void {
        if (this.shouldCleanup()) {
            this.cleanupExpiredClips();
        }
    }

    async createClip(insertClip: InsertClip): Promise<{ id: string; clip: Clip }> {
        // Smart cleanup: automatic in production, optimized in development
        this.performLazyCleanup();
        
        const id = nanoid(12);
        const now = new Date();

        const clip: Clip = {
            id,
            content: insertClip.content,
            expiresAt: insertClip.expiresAt,
            isRevoked: "false",
            createdAt: now,
        };

        this.clips.set(id, clip);
        return { id, clip };
    }

    async getClip(id: string): Promise<Clip | null> {
        // Smart cleanup before retrieval
        this.performLazyCleanup();
        
        const clip = this.clips.get(id);

        if (!clip) return null;

        // Check if expired
        if (new Date() > new Date(clip.expiresAt)) {
            this.clips.delete(id);
            return null;
        }

        // Check if revoked
        if (clip.isRevoked === "true") {
            return null;
        }

        return clip;
    }

    async revokeClip(id: string): Promise<boolean> {
        const clip = this.clips.get(id);

        if (!clip) return false;

        // Mark as revoked instead of deleting
        const revokedClip: Clip = {
            ...clip,
            isRevoked: "true"
        };

        this.clips.set(id, revokedClip);
        return true;
    }

    // Synchronous cleanup for serverless environment
    cleanupExpiredClips(): number {
        const now = new Date();
        let deletedCount = 0;

        const clipEntries = Array.from(this.clips.entries());
        for (const [id, clip] of clipEntries) {
            if (now > new Date(clip.expiresAt)) {
                this.clips.delete(id);
                deletedCount++;
            }
        }

        // Update last cleanup timestamp
        this.lastCleanup = now.getTime();
        
        return deletedCount;
    }
}

export const storage = new MemStorage();
