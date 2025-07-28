import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { nanoid } from 'nanoid';

// Inline storage implementation for development
class DevMemStorage {
    constructor() {
        this.clips = new Map();
        // Clean up expired clips every 5 minutes
        setInterval(() => { this.cleanupExpiredClips(); }, 5 * 60 * 1000);
    }

    async createClip(insertClip) {
        const id = nanoid(12);
        const now = new Date();

        const clip = {
            id,
            content: insertClip.content,
            expiresAt: insertClip.expiresAt,
            isRevoked: "false",
            createdAt: now,
        };

        this.clips.set(id, clip);
        return { id, clip };
    }

    async getClip(id) {
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

    async revokeClip(id) {
        const clip = this.clips.get(id);

        if (!clip) return false;

        // Mark as revoked instead of deleting
        const revokedClip = {
            ...clip,
            isRevoked: "true"
        };

        this.clips.set(id, revokedClip);
        return true;
    }

    async cleanupExpiredClips() {
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

const devStorage = new DevMemStorage();

// Inline schema for development
const createClipRequestSchema = z.object({
    content: z.string().min(1, "Content cannot be empty").max(10000, "Content too large"),
    expiryDuration: z.enum(["2min", "5min", "10min", "1hour", "24hour"]).optional(),
    customExpiry: z.string().optional(),
});

function calculateExpiryDate(expiryDuration, customExpiry) {
    const now = new Date();
    if (customExpiry) {
        const customDate = new Date(customExpiry);
        if (customDate <= now) throw new Error("Custom expiry must be in the future");
        return customDate;
    }
    const mapping = {
        "2min": 2, "5min": 5, "10min": 10, "1hour": 60, "24hour": 1440
    };
    const mins = mapping[expiryDuration ?? "10min"] || 10;
    return new Date(now.getTime() + mins * 60 * 1000);
}

export function apiDevPlugin() {
    return {
        name: 'api-dev',
        configureServer(server) {
            server.middlewares.use('/api', async (req, res, next) => {
                console.log(`[API Plugin] ${req.method} ${req.url}`);

                // Set CORS headers
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

                if (req.method === 'OPTIONS') {
                    res.statusCode = 200;
                    res.end();
                    return;
                }

                try {
                    // In Vite middleware, req.url is the path after the middleware mount point
                    // So for '/api/clips', req.url will be '/clips'
                    const pathname = req.url;
                    console.log(`[API Plugin] Parsed pathname: ${pathname}`);

                    // Handle POST /clips (which is /api/clips from the client)
                    if (pathname === '/clips' && req.method === 'POST') {
                        console.log('[API Plugin] Handling POST /clips');
                        let body = '';
                        req.on('data', chunk => body += chunk);
                        req.on('end', async () => {
                            try {
                                console.log('[API Plugin] Request body:', body);
                                const data = createClipRequestSchema.parse(JSON.parse(body));
                                const expiresAt = calculateExpiryDate(data.expiryDuration, data.customExpiry);
                                const { id, clip } = await devStorage.createClip({ content: data.content, expiresAt });

                                res.setHeader('Content-Type', 'application/json');
                                res.statusCode = 200;
                                res.end(JSON.stringify({ id, expiresAt: clip.expiresAt, success: true }));
                            } catch (err) {
                                console.error('[API Plugin] POST Error:', err);
                                res.setHeader('Content-Type', 'application/json');
                                if (err instanceof z.ZodError) {
                                    res.statusCode = 400;
                                    res.end(JSON.stringify({ success: false, message: fromZodError(err).message }));
                                } else {
                                    res.statusCode = 400;
                                    res.end(JSON.stringify({ success: false, message: err instanceof Error ? err.message : "Invalid request" }));
                                }
                            }
                        });
                        return;
                    }

                    // Handle GET /clips/{id}
                    const clipMatch = pathname.match(/^\/clips\/([^\/]+)$/);
                    if (clipMatch && req.method === 'GET') {
                        console.log(`[API Plugin] Handling GET /clips/${clipMatch[1]}`);
                        const id = clipMatch[1];
                        const clip = await devStorage.getClip(id);

                        res.setHeader('Content-Type', 'application/json');
                        if (!clip) {
                            res.statusCode = 404;
                            res.end(JSON.stringify({ success: false, message: "Clip not found or expired" }));
                        } else {
                            res.statusCode = 200;
                            res.end(JSON.stringify({
                                success: true,
                                content: clip.content,
                                expiresAt: clip.expiresAt,
                                createdAt: clip.createdAt
                            }));
                        }
                        return;
                    }

                    // Handle DELETE /clips/{id}
                    if (clipMatch && req.method === 'DELETE') {
                        console.log(`[API Plugin] Handling DELETE /clips/${clipMatch[1]}`);
                        const id = clipMatch[1];
                        const revoked = await devStorage.revokeClip(id);

                        res.setHeader('Content-Type', 'application/json');
                        if (!revoked) {
                            res.statusCode = 404;
                            res.end(JSON.stringify({ success: false, message: "Clip not found" }));
                        } else {
                            res.statusCode = 200;
                            res.end(JSON.stringify({ success: true, message: "Clip revoked successfully" }));
                        }
                        return;
                    }

                    // Default 405 - no route matched
                    console.log(`[API Plugin] No route matched for ${req.method} ${pathname}`);
                    res.setHeader('Content-Type', 'application/json');
                    res.statusCode = 405;
                    res.end(JSON.stringify({ message: "Method not allowed" }));

                } catch (error) {
                    console.error('[API Plugin] Unexpected error:', error);
                    res.setHeader('Content-Type', 'application/json');
                    res.statusCode = 500;
                    res.end(JSON.stringify({ success: false, message: "Internal server error" }));
                }
            });
        }
    };
}
