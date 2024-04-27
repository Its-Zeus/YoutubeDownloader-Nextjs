import { NextRequest, NextResponse } from "next/server";
import ytdl from 'ytdl-core';

function sanitizeFilename(filename: string): string {
    // Replace non-ASCII characters and special characters with underscores
    return filename.replace(/[^\w.]/g, '_');
}

export async function POST(request: NextRequest, response: NextResponse) {
    const body = await request.json();
    const responseHeaders = new Headers(response.headers);
    const url = body.url;
    const itag = parseInt(body.itag);
    const videoUrl = `https://www.youtube.com/watch?v=${url}`;
    const details = (await ytdl.getInfo(videoUrl)).formats.filter((format) => format.itag === itag)[0]

    responseHeaders.set(
        "Content-Disposition",
        `attachment; filename="${sanitizeFilename(body.title)}.${details.container}"`,
      );
    
      responseHeaders.set(
        "User-Agent",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
      );
    const data = ytdl(videoUrl, 
        {
            quality: itag,
        }
    )
    return new Response(data as any, {
        headers: responseHeaders,
    });
}