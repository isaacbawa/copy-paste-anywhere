export const config = {
  runtime: 'edge',
};

import { storage } from "../shared/production-storage";

export default async function handler(request: Request): Promise<Response> {
    if (request.method === "GET") {
        try {
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
                message: error instanceof Error ? error.message : "Unknown error" 
            }, { status: 500 });
        }
    }

    return Response.json({ message: "Method not allowed" }, { status: 405 });
}
