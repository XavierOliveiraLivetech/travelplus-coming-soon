"use client";

import { useGalleryStageScale } from "@/lib/galleryStage";
import { useEffect, useLayoutEffect, useRef } from "react";
import styles from "./GalleryShowcaseVideo.module.css";

const SHOWCASE_PLAYBACK_RATE = 1;

type GalleryShowcaseVideoProps = {
  src: string;
  ariaLabel: string;
  /** Adjusts crop for recordings that need vertical centering (e.g. orçamento). */
  crop?: "default" | "centered";
  onShowcaseFinished?: () => void;
};

export default function GalleryShowcaseVideo({
  src,
  ariaLabel,
  crop = "default",
  onShowcaseFinished,
}: GalleryShowcaseVideoProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const onShowcaseFinishedRef = useRef(onShowcaseFinished);
  const scale = useGalleryStageScale(hostRef);

  useEffect(() => {
    onShowcaseFinishedRef.current = onShowcaseFinished;
  }, [onShowcaseFinished]);

  useLayoutEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    // Muted product recordings are content, not decorative motion — still play
    // when the OS has prefers-reduced-motion (common when Windows animations are off).

    const onEnded = () => {
      onShowcaseFinishedRef.current?.();
    };

    video.addEventListener("ended", onEnded);

    let cancelled = false;
    let attempts = 0;
    video.muted = true;
    video.playbackRate = SHOWCASE_PLAYBACK_RATE;

    const tryPlay = () => {
      if (cancelled || !video.paused) {
        return;
      }

      attempts += 1;
      video.muted = true;
      video.playbackRate = SHOWCASE_PLAYBACK_RATE;

      void video.play().then(
        () => undefined,
        () => {
          if (cancelled || attempts >= 4) {
            return;
          }

          window.setTimeout(tryPlay, 160 * attempts);
        },
      );
    };

    const onReady = () => {
      tryPlay();
    };

    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      tryPlay();
    }

    return () => {
      cancelled = true;
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
    };
  }, [src]);

  return (
    <div className={styles.root} role="img" aria-label={ariaLabel}>
      <div className={styles.scaleHost} ref={hostRef}>
        <div
          className={styles.sheet}
          style={{ transform: `scale(${scale})` }}
        >
          <div className={styles.card}>
            <div className={styles.videoFrame}>
              <video
                ref={videoRef}
                className={`${styles.video}${
                  crop === "centered" ? ` ${styles.videoCentered}` : ""
                }`}
                src={src}
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
