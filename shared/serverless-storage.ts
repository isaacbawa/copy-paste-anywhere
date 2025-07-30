import { nanoid } from "nanoid";
import type { InsertClip, Clip } from "./schema";

// Enhanced serverless storage with multiple persistence strategies
class ServerlessStorage {
    private cache: Map<string, Clip> | null = null;
    private lastCacheTime = 0;
    private readonly CACHE_TTL = 10 * 1000; // 10 seconds cache

    constructor() {
        // Initialize without persistent processes
    }

    private async getStorageData(): Promise<Map<string, Clip>> {
        const now = Date.now();
        
        // Use cache if recent
        if (this.cache && (now - this.lastCacheTime) < this.CACHE_TTL) {
            return this.cache;
        }

        // Create new storage instance
        const storage = new Map<string, Clip>();
        
        // Strategy 1: Use global object for same-instance persistence
        const globalThis = global as any;
        if (globalThis.__clipStorage) {
            // Copy from global storage
            for (const [id, clip] of globalThis.__clipStorage.entries()) {
                storage.set(id, clip);
            }
        } else {
            globalThis.__clipStorage = storage;
        }

        // Strategy 2: Try to restore from environment variable (for Vercel persistence)
        try {
            if (process.env.VERCEL_STORAGE_DATA) {
                const stored = JSON.parse(process.env.VERCEL_STORAGE_DATA);
                for (const [id, clipData] of Object.entries(stored as Record<string, any>)) {
                    const clip: Clip = {
                        ...clipData,
                        createdAt: new Date(clipData.createdAt),
                        expiresAt: new Date(clipData.expiresAt)
                    };
                    storage.set(id, clip);
                }
            }
        } catch (error) {
            console.warn('Could not restore from environment storage:', error);
        }

        // Update cache
        this.cache = storage;
        this.lastCacheTime = now;
        
        // Sync back to global
        globalThis.__clipStorage = storage;

        return storage;
    }

    private async persistStorageData(storage: Map<string, Clip>): Promise<void> {
        try {
            // Strategy 1: Keep in global for same-instance access
            const globalThis = global as any;
            globalThis.__clipStorage = storage;

            // Strategy 2: Attempt to persist to environment (limited effectiveness in serverless)
            // This is mainly for debugging and monitoring
            const data: Record<string, any> = {};
            const entries = Array.from(storage.entries());
            for (const [id, clip] of entries) {
                data[id] = {
                    ...clip,
                    createdAt: clip.createdAt.toISOString(),
                    expiresAt: clip.expiresAt.toISOString()
                };
            }
            
            // Note: This won't persist across different function instances in production
            // but helps with debugging and same-instance requests
            process.env.VERCEL_STORAGE_DATA = JSON.stringify(data);
            
        } catch (error) {
            console.warn('Could not persist storage data:', error);
        }
    }

    private async cleanupExpiredClipsInternal(storage: Map<string, Clip>): Promise<number> {
        const now = new Date();
        let deletedCount = 0;

        const entries = Array.from(storage.entries());
        for (const [id, clip] of entries) {
            if (now > new Date(clip.expiresAt)) {
                storage.delete(id);
                deletedCount++;
            }
        }

        if (deletedCount > 0) {
            await this.persistStorageData(storage);
        }

        return deletedCount;
    }

    async createClip(insertClip: InsertClip): Promise<{ id: string; clip: Clip }> {
        const storage = await this.getStorageData();
        
        // Clean up expired clips
        await this.cleanupExpiredClipsInternal(storage);
        
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
        await this.persistStorageData(storage);
        
        return { id, clip };
    }

    async getClip(id: string): Promise<Clip | null> {
        const storage = await this.getStorageData();
        
        // Clean up expired clips periodically
        await this.cleanupExpiredClipsInternal(storage);
        
        const clip = storage.get(id);

        if (!clip) return null;

        // Real-time expiry check
        if (new Date() > new Date(clip.expiresAt)) {
            storage.delete(id);
            await this.persistStorageData(storage);
            return null;
        }

        // Check if revoked
        if (clip.isRevoked === "true") {
            return null;
        }

        return clip;
    }

    async revokeClip(id: string): Promise<boolean> {
        const storage = await this.getStorageData();
        const clip = storage.get(id);

        if (!clip) return false;

        // Mark as revoked instead of deleting
        const revokedClip: Clip = {
            ...clip,
            isRevoked: "true"
        };

        storage.set(id, revokedClip);
        await this.persistStorageData(storage);
        
        return true;
    }

    async cleanupExpiredClips(): Promise<number> {
        const storage = await this.getStorageData();
        return await this.cleanupExpiredClipsInternal(storage);
    }

    // Get current storage stats for debugging
    async getStorageStats(): Promise<{ totalClips: number; activeClips: number }> {
        const storage = await this.getStorageData();
        const now = new Date();
        let activeCount = 0;
        
        const entries = Array.from(storage.entries());
        for (const [_, clip] of entries) {
            if (new Date(clip.expiresAt) > now && clip.isRevoked === "false") {
                activeCount++;
            }
        }
        
        return {
            totalClips: storage.size,
            activeClips: activeCount
        };
    }
}

export const storage = new ServerlessStorage();
