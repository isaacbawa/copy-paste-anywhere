import { storage } from "../shared/edge-storage";

export const config = {
    runtime: 'edge',
};

export default async function handler(request: Request): Promise<Response> {
    console.log('🔍 Debug endpoint called:', request.method, request.url);
    
    try {
        if (request.method !== "GET") {
            return Response.json({ message: "Method not allowed" }, { status: 405 });
        }

        try {
            console.log('📊 Getting storage stats...');
            const stats = await storage.getStorageStats();
            console.log('✅ Storage stats retrieved:', stats);
            
            const response = {
                success: true,
                timestamp: new Date().toISOString(),
                environment: {
                    runtime: 'edge',
                    vercel: !!process.env.VERCEL,
                    nodeEnv: process.env.NODE_ENV
                },
                storage: stats
            };
            
            console.log('🎯 Sending response:', response);
            return Response.json(response);
        } catch (error) {
            console.error('❌ Debug endpoint error:', error);
            return Response.json({ 
                success: false, 
                message: error instanceof Error ? error.message : "Unknown error",
                timestamp: new Date().toISOString()
            }, { status: 500 });
        }
    } catch (error) {
        console.error('❌ Unexpected error in debug handler:', error);
        return Response.json({ 
            success: false, 
            message: "Internal server error" 
        }, { status: 500 });
    }
}
