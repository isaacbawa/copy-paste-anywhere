import { storage } from "../../shared/edge-storage";

export const config = {
    runtime: 'edge',
};

export default async function handler(request: Request) {
    try {
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const id = pathParts[pathParts.length - 1];

        if (request.method === "GET") {
            const clip = await storage.getClip(id);
            if (!clip) {
                return Response.json({ success: false, message: "Clip not found or expired" }, { status: 404 });
            }
            
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
                return Response.json({ success: false, message: "Clip not found" }, { status: 404 });
            }
            
            return Response.json({ success: true, message: "Clip revoked successfully" });
        }

        return Response.json({ message: "Method not allowed" }, { status: 405 });
    } catch (error) {
        return Response.json({ 
            success: false, 
            message: "Internal server error" 
        }, { status: 500 });
    }
}
