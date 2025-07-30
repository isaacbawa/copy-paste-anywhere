export const config = {
  runtime: 'edge',
};

import { z } from "zod";
import { storage } from "../shared/storage";
import { createClipRequestSchema } from "../shared/schema";
import { fromZodError } from "zod-validation-error";

function calculateExpiryDate(expiryDuration?: string, customExpiry?: string): Date {
    const now = new Date();
    if (customExpiry) {
        const customDate = new Date(customExpiry);
        if (customDate <= now) throw new Error("Custom expiry must be in the future");
        return customDate;
    }
    const mapping: Record<string, number> = {
        "2min": 2, "5min": 5, "10min": 10, "1hour": 60, "24hour": 1440
    };
    const mins = mapping[expiryDuration ?? "10min"] || 10;
    return new Date(now.getTime() + mins * 60 * 1000);
}

export default async function handler(request: Request): Promise<Response> {
    if (request.method === "POST") {
        try {
            const body = await request.json();
            const data = createClipRequestSchema.parse(body);

            const expiresAt = calculateExpiryDate(data.expiryDuration, data.customExpiry);
            const { id, clip } = await storage.createClip({ content: data.content, expiresAt });

            return Response.json({ id, expiresAt: clip.expiresAt, success: true });
        } catch (err) {
            if (err instanceof z.ZodError) {
                return Response.json({ success: false, message: fromZodError(err).message }, { status: 400 });
            }
            return Response.json({ success: false, message: err instanceof Error ? err.message : "Invalid request" }, { status: 400 });
        }
    }

    if (request.method === "POST" && request.url?.endsWith("/cleanup")) {
        try {
            const deletedCount = await storage.cleanupExpiredClips();
            return Response.json({ success: true, deletedCount });
        } catch {
            return Response.json({ success: false, message: "Cleanup failed" }, { status: 500 });
        }
    }

    return Response.json({ message: "Method not allowed" }, { status: 405 });
}
