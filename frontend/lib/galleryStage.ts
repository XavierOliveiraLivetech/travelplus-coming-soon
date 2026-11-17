import { type RefObject, useLayoutEffect, useState } from "react";

/** Shared 16:9 design canvas for gallery showcase slides */
export const GALLERY_STAGE_W = 960;
export const GALLERY_STAGE_H = 540;

export function useGalleryStageScale(
  hostRef: RefObject<HTMLElement | null>,
): number {
  const [scale, setScale] = useState(1);

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
      setScale(
        Math.min(width / GALLERY_STAGE_W, height / GALLERY_STAGE_H),
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(host);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hostRef is stable
  }, []);

  return scale;
}
