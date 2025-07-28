import { nanoid } from "nanoid";
import type { InsertClip, Clip } from "./schema";

// In-memory storage implementation for serverless deployment
class MemStorage {
    private clips: Map<string, Clip>;

    constructor() {
        this.clips = new Map();
        // Clean up expired clips every 5 minutes
        setInterval(() => { this.cleanupExpiredClips(); }, 5 * 60 * 1000);
    }

    async createClip(insertClip: InsertClip): Promise<{ id: string; clip: Clip }> {
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

    async cleanupExpiredClips(): Promise<number> {
        const now = new Date();
        let deletedCount = 0;

        const clipEntries = Array.from(this.clips.entries());
        for (const [id, clip] of clipEntries) {
            if (now > new Date(clip.expiresAt)) {
                this.clips.delete(id);
                deletedCount++;
            }
        }

        return deletedCount;
    }
}

export const storage = new MemStorage();
