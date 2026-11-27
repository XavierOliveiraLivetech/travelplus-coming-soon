"use client";

import { withBasePath } from "@/lib/basePath";
import { useEffect, useRef, useState } from "react";

// ?v=2: remuxed with the index (moov) first so playback starts without a
// second request for the end of the file. Video frames are bit-identical.
const VIDEO_SRC = withBasePath(encodeURI("/Video/Video.mp4") + "?v=2");
const IMAGE_SRC = withBasePath("/Img/Background.webp");

export default function BackgroundMedia() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | undefined>(undefined);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // The 12 MB video only starts downloading once the page has loaded, so it
  // doesn't compete with the CSS, JS, font and images the first paint needs.
  // Until then the background image shows, exactly as it did while the video
  // was buffering.
  useEffect(() => {
    const start = () => setVideoSrc(VIDEO_SRC);

    if (document.readyState === "complete") {
      start();
      return;
    }

    window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;

    const revealVideo = () => {
      video
        .play()
        .then(() => setIsVideoReady(true))
        .catch(() => setIsVideoReady(true));
    };

    if (video.readyState >= 3) {
      revealVideo();
      return;
    }

    video.addEventListener("canplaythrough", revealVideo, { once: true });

    return () => {
      video.removeEventListener("canplaythrough", revealVideo);
    };
  }, [videoSrc]);

  return (
    <div className="coming-soon-background">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={IMAGE_SRC}
        alt=""
        className="coming-soon-background-image"
      />

      <video
        ref={videoRef}
        className={`coming-soon-background-video${isVideoReady ? " is-ready" : ""}`}
        src={videoSrc}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />

      <div className="coming-soon-background-overlay" aria-hidden="true" />
    </div>
  );
}
