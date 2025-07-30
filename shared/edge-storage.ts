import { nanoid } from "nanoid";
import type { InsertClip, Clip } from "./schema";

// Module-level storage for Edge Runtime compatibility
const moduleStorage = new Map<string, Clip>();

// Edge Runtime compatible storage - uses only standard Web APIs
class EdgeCompatibleStorage {
    constructor() {
        // No constructor logic needed for Edge Runtime
    }

    private isExpired(expiresAt: Date): boolean {
        return new Date() > new Date(expiresAt);
    }

    private isRevoked(clip: Clip): boolean {
        return clip.isRevoked === "true";
    }

    // Simple in-memory storage that works in Edge Runtime
    private getMemoryStorage(): Map<string, Clip> {
        // Use globalThis with proper typing for Edge Runtime
        try {
            const global = globalThis as any;
            if (!global.__edgeClipStorage) {
                global.__edgeClipStorage = new Map<string, Clip>();
            }
            return global.__edgeClipStorage;
        } catch {
            // Fallback to module-level storage if globalThis fails
            return moduleStorage;
        }
    }

    private cleanupExpiredClipsInternal(storage: Map<string, Clip>): number {
        const now = new Date();
        let deletedCount = 0;
        const entries = Array.from(storage.entries());
        
        for (const [id, clip] of entries) {
            if (this.isExpired(clip.expiresAt)) {
                storage.delete(id);
                deletedCount++;
            }
        }
        
        return deletedCount;
    }

    async createClip(insertClip: InsertClip): Promise<{ id: string; clip: Clip }> {
        const storage = this.getMemoryStorage();
        
        // Simple cleanup - remove expired clips
        this.cleanupExpiredClipsInternal(storage);
        
        const id = nanoid(12);
        const now = new Date();
        
        const clip: Clip = {
            id,
            content: insertClip.content,
            expiresAt: insertClip.expiresAt,
            isRevoked: "false",
            createdAt: now,
        };

        storage.set(id, clip);
        return { id, clip };
    }

    async getClip(id: string): Promise<Clip | null> {
        const storage = this.getMemoryStorage();
        
        // Cleanup expired clips
        this.cleanupExpiredClipsInternal(storage);
        
        const clip = storage.get(id);
        if (!clip) return null;

        // Check if expired
        if (this.isExpired(clip.expiresAt)) {
            storage.delete(id);
            return null;
        }

        // Check if revoked
        if (this.isRevoked(clip)) {
            return null;
        }

        return clip;
    }

    async revokeClip(id: string): Promise<boolean> {
        const storage = this.getMemoryStorage();
        const clip = storage.get(id);

        if (!clip) return false;

        // Mark as revoked
        const revokedClip: Clip = {
            ...clip,
            isRevoked: "true"
        };

        storage.set(id, revokedClip);
        return true;
    }

    async cleanupExpiredClips(): Promise<number> {
        const storage = this.getMemoryStorage();
        return this.cleanupExpiredClipsInternal(storage);
    }

    async getStorageStats(): Promise<{ totalClips: number; activeClips: number }> {
        const storage = this.getMemoryStorage();
        let activeCount = 0;
        const entries = Array.from(storage.entries());
        
        for (const [_, clip] of entries) {
            if (!this.isExpired(clip.expiresAt) && !this.isRevoked(clip)) {
                activeCount++;
            }
        }
        
        return {
            totalClips: storage.size,
            activeClips: activeCount
        };
    }
}

export const storage = new EdgeCompatibleStorage();
