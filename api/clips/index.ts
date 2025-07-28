import { storage } from "../../shared/storage";
import { createClipRequestSchema } from "../../shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export default async function handler(req: Request) {
    if (req.method === "POST") {
        try {
            const body = await req.json();
            const validatedData = createClipRequestSchema.parse(body);
            const now = new Date();

            let expiresAt = new Date(now.getTime() + 10 * 60 * 1000);
            if (validatedData.customExpiry) {
                const customDate = new Date(validatedData.customExpiry);
                if (customDate <= now) {
                    return new Response(JSON.stringify({ success: false, message: "Custom expiry must be in the future" }), { status: 400 });
                }
                expiresAt = customDate;
            } else {
                const durations = {
                    "2min": 2,
                    "5min": 5,
                    "10min": 10,
                    "1hour": 60,
                    "24hour": 1440,
                };
                const mins = durations[validatedData.expiryDuration ?? "10min"] || 10;
                expiresAt = new Date(now.getTime() + mins * 60 * 1000);
            }

            const { id, clip } = await storage.createClip({
                content: validatedData.content,
                expiresAt,
            });

            return Response.json({
                id,
                expiresAt: clip.expiresAt,
                success: true,
            });

        } catch (error) {
            if (error instanceof z.ZodError) {
                return Response.json({ success: false, message: fromZodError(error).message }, { status: 400 });
            }

            return Response.json({ success: false, message: "Invalid request" }, { status: 400 });
        }
    }

    return new Response("Method Not Allowed", { status: 405 });
}
