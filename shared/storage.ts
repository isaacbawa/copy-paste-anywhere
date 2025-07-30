import { nanoid } from "nanoid";
import type { InsertClip, Clip } from "./schema";

// Serverless-first storage implementation - NO background timers
class MemStorage {
    private clips: Map<string, Clip>;
    private lastCleanup: number;
    private readonly CLEANUP_INTERVAL = 2 * 60 * 1000; // 2 minutes

    constructor() {
        this.clips = new Map();
        this.lastCleanup = Date.now();
        
        // ZERO background processes - fully serverless compatible
        // All cleanup happens on-demand during operations
    }

    private shouldCleanup(): boolean {
        // Cleanup every 2 minutes of activity to keep memory efficient
        return Date.now() - this.lastCleanup > this.CLEANUP_INTERVAL;
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
