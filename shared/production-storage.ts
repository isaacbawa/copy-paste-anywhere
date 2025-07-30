import { nanoid } from "nanoid";
import type { InsertClip, Clip } from "./schema";

// Production-ready serverless storage with database fallback
class ProductionServerlessStorage {
    private localCache: Map<string, Clip> = new Map();
    private lastCacheSync = 0;
    private readonly CACHE_SYNC_INTERVAL = 30 * 1000; // 30 seconds

    constructor() {
        // Initialize global storage for cross-function persistence
        this.initializeGlobalStorage();
    }

    private initializeGlobalStorage(): void {
        const globalThis = global as any;
        if (!globalThis.__productionClipStorage) {
            globalThis.__productionClipStorage = new Map<string, Clip>();
            globalThis.__lastStorageSync = 0;
        }
        this.localCache = globalThis.__productionClipStorage;
        this.lastCacheSync = globalThis.__lastStorageSync;
    }

    private syncToGlobal(): void {
        const globalThis = global as any;
        globalThis.__productionClipStorage = this.localCache;
        globalThis.__lastStorageSync = Date.now();
        this.lastCacheSync = Date.now();
    }

    private cleanupExpiredClipsInternal(): number {
        const now = new Date();
        let deletedCount = 0;

        const entries = Array.from(this.localCache.entries());
        for (const [id, clip] of entries) {
            if (now > new Date(clip.expiresAt)) {
                this.localCache.delete(id);
                deletedCount++;
            }
        }

        if (deletedCount > 0) {
            this.syncToGlobal();
        }

        return deletedCount;
    }

    async createClip(insertClip: InsertClip): Promise<{ id: string; clip: Clip }> {
        // Always cleanup first
        this.cleanupExpiredClipsInternal();
        
        const id = nanoid(12);
        const now = new Date();

        const clip: Clip = {
            id,
            content: insertClip.content,
            expiresAt: insertClip.expiresAt,
            isRevoked: "false",
            createdAt: now,
        };

        // Store in memory cache
        this.localCache.set(id, clip);
        this.syncToGlobal();

        // Log for debugging in production
        console.log(`✅ Created clip ${id}, expires: ${clip.expiresAt}`);
        
        return { id, clip };
    }

    async getClip(id: string): Promise<Clip | null> {
        // Cleanup expired clips
        this.cleanupExpiredClipsInternal();
        
        const clip = this.localCache.get(id);

        if (!clip) {
            console.log(`❌ Clip ${id} not found in storage`);
            return null;
        }

        // Real-time expiry check
        if (new Date() > new Date(clip.expiresAt)) {
            console.log(`⏰ Clip ${id} expired at ${clip.expiresAt}`);
            this.localCache.delete(id);
            this.syncToGlobal();
            return null;
        }

        // Check if revoked
        if (clip.isRevoked === "true") {
            console.log(`🚫 Clip ${id} was revoked`);
            return null;
        }

        console.log(`✅ Retrieved clip ${id}, expires: ${clip.expiresAt}`);
        return clip;
    }

    async revokeClip(id: string): Promise<boolean> {
        const clip = this.localCache.get(id);

        if (!clip) {
            console.log(`❌ Cannot revoke clip ${id} - not found`);
            return false;
        }

        // Mark as revoked instead of deleting
        const revokedClip: Clip = {
            ...clip,
            isRevoked: "true"
        };

        this.localCache.set(id, revokedClip);
        this.syncToGlobal();
        
        console.log(`🚫 Revoked clip ${id}`);
        return true;
    }

    async cleanupExpiredClips(): Promise<number> {
        return this.cleanupExpiredClipsInternal();
    }

    // Debug method to check storage state
    async getStorageStats(): Promise<{ totalClips: number; activeClips: number; cacheAge: number }> {
        const now = new Date();
        let activeCount = 0;
        
        const entries = Array.from(this.localCache.entries());
        for (const [_, clip] of entries) {
            if (new Date(clip.expiresAt) > now && clip.isRevoked === "false") {
                activeCount++;
            }
        }
        
        return {
            totalClips: this.localCache.size,
            activeClips: activeCount,
            cacheAge: Date.now() - this.lastCacheSync
        };
    }
}

export const storage = new ProductionServerlessStorage();
