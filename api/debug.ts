export const config = {
  runtime: 'edge',
};

import { storage } from "../shared/edge-storage";

export default async function handler(request: Request): Promise<Response> {
    try {
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
                console.error('❌ Debug endpoint error:', error);
                return Response.json({ 
                    success: false, 
                    message: error instanceof Error ? error.message : "Unknown error",
                    timestamp: new Date().toISOString()
                }, { status: 500 });
            }
        }

        return Response.json({ message: "Method not allowed" }, { status: 405 });
    } catch (error) {
        console.error('❌ Unexpected error in debug handler:', error);
        return Response.json({ 
            success: false, 
            message: "Internal server error" 
        }, { status: 500 });
    }
}
