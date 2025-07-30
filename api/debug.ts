import { storage } from "../shared/edge-storage";

export const config = {
    runtime: 'edge',
};

export default async function handler(request: Request): Promise<Response> {
    try {
        if (request.method !== "GET") {
            return Response.json({ message: "Method not allowed" }, { status: 405 });
        }

        const stats = await storage.getStorageStats();
        
        return Response.json({
            success: true,
            timestamp: new Date().toISOString(),
            environment: {
                runtime: 'edge',
                vercel: !!process.env.VERCEL,
                nodeEnv: process.env.NODE_ENV
            },
            storage: stats
        });
    } catch (error) {
        return Response.json({ 
            success: false, 
            message: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
