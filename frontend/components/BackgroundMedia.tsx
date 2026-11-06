"use client";

import { withBasePath } from "@/lib/basePath";
import { useEffect, useRef, useState } from "react";

const VIDEO_SRC = withBasePath(encodeURI("/Video/Video.mp4"));
const IMAGE_SRC = withBasePath("/Img/Background.jpg?v=2");

export default function BackgroundMedia() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

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
  }, []);

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
        src={VIDEO_SRC}
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
