export default async function handler(request: Request): Promise<Response> {
    return Response.json({ 
        message: "Hello from Vercel Edge Runtime!",
        timestamp: new Date().toISOString(),
        method: request.method 
    });
}
