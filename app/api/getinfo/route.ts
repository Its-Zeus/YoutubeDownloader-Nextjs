import { NextRequest, NextResponse } from "next/server";
import ytdl from 'ytdl-core';


export async function POST(request: NextRequest, response: NextResponse) {

    const body = await request.json();
    const url = await body.url;
    const videoUrl = `https://www.youtube.com/watch?v=${url}`;
    const infos = await ytdl.getInfo(videoUrl);
    const title = infos.videoDetails.title
    const iframe = infos.videoDetails.embed.iframeUrl
    const tumb = infos.videoDetails.thumbnails[0].url
    const length = infos.videoDetails.lengthSeconds
    const views = infos.videoDetails.viewCount
    const description = infos.videoDetails.description
    const formats = infos.formats
    

    return NextResponse.json({
        title: title,
        iframe: iframe,
        tumb: tumb,
        length: length,
        views: views,
        description: description,
        formats : formats
    });
    
}