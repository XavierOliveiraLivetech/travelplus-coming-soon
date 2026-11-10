"use client";

import { PESQUISA_AGRUPADA_VIDEO_SRC } from "@/lib/galleryVideos";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./PesquisaAgrupadaVideo.module.css";

const DESIGN_W = 960;
const DESIGN_H = 540;

type PesquisaAgrupadaVideoProps = {
  onShowcaseFinished?: () => void;
};

export default function PesquisaAgrupadaVideo({
  onShowcaseFinished,
}: PesquisaAgrupadaVideoProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const onShowcaseFinishedRef = useRef(onShowcaseFinished);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    onShowcaseFinishedRef.current = onShowcaseFinished;
  }, [onShowcaseFinished]);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }

    const update = () => {
      const { width, height } = host.getBoundingClientRect();
      if (width <= 0 || height <= 0) {
        return;
      }
      setScale(Math.min(width / DESIGN_W, height / DESIGN_H));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const onEnded = () => {
      onShowcaseFinishedRef.current?.();
    };

    video.addEventListener("ended", onEnded);

    if (prefersReducedMotion) {
      video.pause();
      onShowcaseFinishedRef.current?.();
      return () => {
        video.removeEventListener("ended", onEnded);
      };
    }

    video.currentTime = 0;
    video.play().catch(() => undefined);

    return () => {
      video.removeEventListener("ended", onEnded);
    };
  }, []);

  return (
    <div
      className={styles.root}
      role="img"
      aria-label="Gravação: pesquisa agrupada no Livetrip — Hilton Cabo Verde, regime só alojamento e quartos"
    >
      <div className={styles.scaleHost} ref={hostRef}>
        <div
          className={styles.sheet}
          style={{ transform: `scale(${scale})` }}
        >
          <div className={styles.card}>
            <div className={styles.videoFrame}>
              <video
                ref={videoRef}
                className={styles.video}
                src={PESQUISA_AGRUPADA_VIDEO_SRC}
                muted
                playsInline
                autoPlay
                preload="auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
