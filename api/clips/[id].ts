import { storage } from "../../shared/edge-storage";

export const config = {
    runtime: 'edge',
};

export default async function handler(request: Request) {
    try {
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const id = pathParts[pathParts.length - 1];

        console.log(`📋 Clip request: ${request.method} ${id}`);

        if (request.method === "GET") {
            const clip = await storage.getClip(id);
            if (!clip) {
                console.log(`❌ Clip not found: ${id}`);
                return Response.json({ success: false, message: "Clip not found or expired" }, { status: 404 });
            }
            
            console.log(`✅ Clip retrieved: ${id}`);
            return Response.json({
                success: true,
                content: clip.content,
                expiresAt: clip.expiresAt,
                createdAt: clip.createdAt
            });
        }

        if (request.method === "DELETE") {
            const revoked = await storage.revokeClip(id);
            if (!revoked) {
                console.log(`❌ Clip revocation failed: ${id}`);
                return Response.json({ success: false, message: "Clip not found" }, { status: 404 });
            }
            
            console.log(`🚫 Clip revoked: ${id}`);
            return Response.json({ success: true, message: "Clip revoked successfully" });
        }

        return Response.json({ message: "Method not allowed" }, { status: 405 });
    } catch (error) {
        console.error('❌ Unexpected error in clip handler:', error);
        return Response.json({ 
            success: false, 
            message: "Internal server error" 
        }, { status: 500 });
    }
}
