"use client"
import { useState } from 'react'
import ParticlesComponent from '@/components/particles'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from 'next/image'
import youtubelogo from '@/public/youtube.png'
import * as React from "react"
import { LiaVolumeMuteSolid } from "react-icons/lia";
import JsFileDownloader from 'js-file-downloader';
import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"
import Link from 'next/link'
 
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Formats {
  url: string;
  mimeType: string;
  qualityLabel: string;
  itag: number;
  contentLength: string;
  bitrate: number;
  audioQuality: string;
  container : string;
  hasAudio : boolean
}
export default function Home() {
  const [info, setInfo] = useState(false)
  const [title , setTitle] = useState('')
  const [embed , setEmbed] = useState('')
  const [tumb , setTumb] = useState('')
  const [length , setLength] = useState('')
  const [views , setViews] = useState('')
  const [description , setDescription] = useState('')
  const [formats , setFormats] : [Formats[] , any] = useState([])
  const [urll , setUrll] = useState('')
  const [download , setDownload] = useState(0)
  const [searching , setSearching] = useState(false)
  const [downloaditag , setDownloaditag] = useState("")
  const [downloading , setDownloading] = useState(false)
  const stripYoutubeId = (url: string) => {
  const newurl = url.split(/^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/);
  return newurl.length > 1 ? newurl[1] : '';
}
  function secondsToTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}
  const infos = async () => {
    setSearching(true)
    const videoid = stripYoutubeId(urll)
    const res = await fetch('/api/getinfo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: videoid
      })
    })
    const data = await res.json()
    setTitle(data.title)
    setEmbed(data.iframe)
    setTumb(data.tumb)
    setLength(data.length)
    setViews(data.views)
    setDescription(data.description)
    setFormats(data.formats)
    setInfo(true)
    setSearching(false)
  }
  const handledownload = async (url: string , itag : string) => {
    setDownloading(true)
    const videoid = stripYoutubeId(urll)
    const contentLength = parseInt(formats.filter((format) => format.itag === parseInt(itag))[0].contentLength)
    new JsFileDownloader ({
      url: "/api/download",
      method: 'POST',
      body: JSON.stringify({
        url: videoid,
        itag : itag,
        title: title,
      }),
      filename: `${title}.${formats.filter((format) => format.itag === parseInt(itag))[0].container}`,
      contentTypeDetermination: 'full',
      autoStart: true,
      forceDesktopMode: true,
      process: event => {
        var downloadingPercentage = Math.floor(event.loaded / contentLength * 100);
        setDownload( downloadingPercentage )
    }
    }).then(() => {
      setDownloading(false)
    })
    
  }
  return (
    <>
    <ParticlesComponent id="tsparticles" className='h-[100vh] w-[100vw] absolute -z-10'/>
    <section className='pt-48 px-6'>
    <Image src={youtubelogo} alt="youtube logo" width={400} height={200} className='m-auto'/>
    <div className="flex w-full max-w-lg items-center space-x-2 m-auto pt-10">
      <Input type="email" placeholder="Paste your video link here" onChange={(e) => setUrll(e.target.value)}/>
      <Button disabled={searching ? true : false} type="submit" className='bg-[#FF0000] hover:bg-white hover:text-[#FF0000]' onClick={() => infos()}>
        {searching ?
        <>              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <p>Please wait</p></>
         : <p>Search</p>}
      </Button>
    </div>
    {info &&
    <div className='flex flex-row justify-center mt-10 m-auto flex-wrap gap-6'>
      <iframe src={embed} width='300px' height='200px' className=''></iframe>
      <div className='text-white flex flex-col justify-between py-4 w-[350px] gap-10'>
        <div>
          <h1 className='text-base mb-1'>{title}</h1>
          <p>{secondsToTime(parseInt(length))}</p>
        </div>
        <div className='flex flex-row justify-between'>
          <Select onValueChange={(value) => setDownloaditag(value)}>
            <SelectTrigger className="w-[200px] text-black">
              <SelectValue placeholder="Select Quality"/>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {formats.sort((a, b) => {
                    if (a.hasAudio && !b.hasAudio) {
                      return -1; // a comes before b
                    } else if (!a.hasAudio && b.hasAudio) {
                      return 1; // b comes before a
                    } else {
                      return 0; // order remains unchanged
                    }
                  })
                  .sort((a, b) => {
                    const qualityA = parseInt(a.qualityLabel) || 0;
                    const qualityB = parseInt(b.qualityLabel) || 0;
                    return qualityB - qualityA;
                  }).sort((a, b) => {
                    if (a.container === "mp4" && b.container === "webm") {
                      return -1; // a comes before b
                    } else if (a.container === "webm" && b.container === "mp4") {
                      return 1; // b comes before a
                    } else {
                      return 0; // order remains unchanged
                    }
                  })
                  .map((format, index) => (
                  <SelectItem key={index} value={format.itag.toString()} className='w-[300px] flex flex-row justify-between cursor-pointer'>
                      <div className='inline-block uppercase'>{format.container}</div>
                      {
                        format.qualityLabel && <div className='inline-block'>[{format.qualityLabel}]</div>
                      }
                      {
                        !format.hasAudio && <LiaVolumeMuteSolid color='red' className="w-4 h-4 inline-block ml-2"/>
                      }
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button type="submit" className='bg-white text-black hover:bg-black hover:text-white hover:outline hover:outline-white hover:outline-1' onClick={() => handledownload(urll, downloaditag)}>Download</Button>
        </div>
        {downloading && <Progress value={download} className='h-2 bg-white'/>}
      </div>
    </div> 
    }
    <h1 className='bg-white max-w-[674px] m-auto text-center py-3 rounded-lg mt-5'>Made with ❤️ by <Link className=' text-blue-800 font-bold' href="https://github.com/Its-Zeus">Zeus</Link></h1>
    </section>
    </>
  )
}
