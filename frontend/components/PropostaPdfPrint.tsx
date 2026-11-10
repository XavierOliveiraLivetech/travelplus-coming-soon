"use client";

import { withBasePath } from "@/lib/basePath";
import type { PDFPageProxy } from "pdfjs-dist";
import type { PageViewport } from "pdfjs-dist";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./PropostaPdfPrint.module.css";

const PDF_URL = withBasePath("/Img/sneaks/pdf.pdf");
const WORKER_URL = withBasePath("/pdf.worker.min.mjs");

const DESIGN_W = 960;
const DESIGN_H = 540;

/** First-page band (logo + meta) kept out of the viewport; tuned to pdf.pdf. */
const HEADER_SKIP_RATIO = 0.14;

/** Scroll pacing — duration scales gently with distance (ease-in-out pan). */
const PDF_SCROLL_MS_MIN = 12_000;
const PDF_SCROLL_MS_MAX = 23_000;
const PDF_SCROLL_MS_PER_PX = 24;
/** Hold first frame after the PDF is shown, then start scrolling. */
const PDF_SCROLL_DELAY_MS = 500;

/** Canvas backing-store scale (layout px → physical px). */
const PDF_RENDER_MAX_DPR = 3;

const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
const MOBILE_RE = /9\d{8}/g;

/** Literal tokens in pdf.pdf — redacted by exact substring, not broad patterns. */
const LITERAL_REDACTIONS = [
  "diogo.tavares@livetech.pt",
  "987654321",
] as const;

/** Phone in this sneak PDF (digits only) — used to wipe split glyph runs. */
const SNEAK_MOBILE_DIGITS = "987654321";

type PdfTextItem = {
  str: string;
  transform: number[];
  width: number;
};

type LineSegment = {
  item: PdfTextItem;
  start: number;
  end: number;
};

function isMobileTokenAt(text: string, index: number): boolean {
  if (!/^9\d{8}$/.test(text.slice(index, index + 9))) {
    return false;
  }

  const before = index > 0 ? text[index - 1] : "";
  const after = index + 9 < text.length ? text[index + 9] : "";
  if (before === "/" || after === "/") {
    return false;
  }
  if (/\d/.test(before) || /\d/.test(after)) {
    return false;
  }
  return true;
}

function redactSpanOnCanvas(
  ctx: CanvasRenderingContext2D,
  item: PdfTextItem,
  viewport: PageViewport,
  startIndex: number,
  tokenLength: number,
) {
  const fontHeight = Math.hypot(item.transform[2], item.transform[3]);
  const [x, y] = viewport.convertToViewportPoint(
    item.transform[4],
    item.transform[5],
  );
  const totalWidth = item.width * viewport.scale;
  const textHeight = fontHeight * viewport.scale * 1.12;
  const lineLength = Math.max(item.str.length, 1);

  const rectX = x + totalWidth * (startIndex / lineLength);
  const rectW = totalWidth * (tokenLength / lineLength);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(rectX, y - textHeight + 2, rectW, textHeight + 1);
}

function coverRangeOnLine(
  ctx: CanvasRenderingContext2D,
  segments: LineSegment[],
  rangeStart: number,
  rangeEnd: number,
  viewport: PageViewport,
) {
  for (const seg of segments) {
    const overlapStart = Math.max(rangeStart, seg.start);
    const overlapEnd = Math.min(rangeEnd, seg.end);
    if (overlapStart >= overlapEnd) {
      continue;
    }

    const localStart = overlapStart - seg.start;
    const localLen = overlapEnd - overlapStart;
    redactSpanOnCanvas(ctx, seg.item, viewport, localStart, localLen);
  }
}

function isContactLine(merged: string): boolean {
  return /@|livetech|livetrip/i.test(merged);
}

function isRnavtLine(merged: string): boolean {
  return /rnavt/i.test(merged);
}

function isPhoneFragmentLine(merged: string): boolean {
  const trimmed = merged.trim();
  if (!trimmed) {
    return false;
  }
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 0 || digits.length > 9) {
    return false;
  }
  if (!/^[\d\s·•|.]+$/.test(trimmed)) {
    return false;
  }
  return [...digits].every((digit) => SNEAK_MOBILE_DIGITS.includes(digit));
}

function isOrphanSeparatorLine(merged: string): boolean {
  const trimmed = merged.trim();
  return trimmed.length > 0 && /^[\s·•|.]+$/.test(trimmed);
}

/** Middle dots / pipes left between redacted mail & phone (not part of an email domain). */
function redactLooseContactSeparators(
  ctx: CanvasRenderingContext2D,
  segments: LineSegment[],
  merged: string,
  viewport: PageViewport,
) {
  for (let index = 0; index < merged.length; index += 1) {
    const char = merged[index];
    if (/[·•|]/.test(char)) {
      coverRangeOnLine(ctx, segments, index, index + 1, viewport);
      continue;
    }

    if (char !== ".") {
      continue;
    }

    const prev = index > 0 ? merged[index - 1] : "";
    const next = index + 1 < merged.length ? merged[index + 1] : "";
    if (/[a-z0-9@]/i.test(prev) && /[a-z0-9@]/i.test(next)) {
      continue;
    }

    if (/[\s·•|]/.test(prev) || /[\s·•|]/.test(next) || prev === "") {
      coverRangeOnLine(ctx, segments, index, index + 1, viewport);
    }
  }
}

function redactSensitiveOnLine(
  ctx: CanvasRenderingContext2D,
  segments: LineSegment[],
  merged: string,
  viewport: PageViewport,
) {
  if (isRnavtLine(merged)) {
    return;
  }

  if (isPhoneFragmentLine(merged)) {
    coverRangeOnLine(ctx, segments, 0, merged.length, viewport);
    return;
  }

  if (isOrphanSeparatorLine(merged)) {
    coverRangeOnLine(ctx, segments, 0, merged.length, viewport);
    return;
  }

  for (const token of LITERAL_REDACTIONS) {
    let from = 0;
    while (from < merged.length) {
      const index = merged.indexOf(token, from);
      if (index < 0) {
        break;
      }
      coverRangeOnLine(ctx, segments, index, index + token.length, viewport);
      from = index + token.length;
    }
  }

  for (const match of merged.matchAll(EMAIL_RE)) {
    const index = match.index ?? 0;
    coverRangeOnLine(
      ctx,
      segments,
      index,
      index + match[0].length,
      viewport,
    );
  }
  EMAIL_RE.lastIndex = 0;

  for (const match of merged.matchAll(MOBILE_RE)) {
    const index = match.index ?? 0;
    if (!isMobileTokenAt(merged, index)) {
      continue;
    }
    coverRangeOnLine(ctx, segments, index, index + 9, viewport);
  }
  MOBILE_RE.lastIndex = 0;

  const contactContext = isContactLine(merged);

  if (!contactContext) {
    return;
  }

  for (let len = SNEAK_MOBILE_DIGITS.length; len >= 2; len -= 1) {
    for (let offset = 0; offset <= SNEAK_MOBILE_DIGITS.length - len; offset += 1) {
      const part = SNEAK_MOBILE_DIGITS.slice(offset, offset + len);
      let from = 0;
      while (from < merged.length) {
        const index = merged.indexOf(part, from);
        if (index < 0) {
          break;
        }
        coverRangeOnLine(ctx, segments, index, index + part.length, viewport);
        from = index + part.length;
      }
    }
  }

  for (const match of merged.matchAll(/[·•|]\s*[\d\s]+/g)) {
    const digits = match[0].replace(/\D/g, "");
    if (digits.length === 0) {
      continue;
    }
    if (
      !SNEAK_MOBILE_DIGITS.includes(digits) &&
      !digits.split("").every((d) => SNEAK_MOBILE_DIGITS.includes(d))
    ) {
      continue;
    }
    const index = match.index ?? 0;
    coverRangeOnLine(
      ctx,
      segments,
      index,
      index + match[0].length,
      viewport,
    );
  }

  redactLooseContactSeparators(ctx, segments, merged, viewport);
}

async function scrubSensitiveFromCanvas(
  page: PDFPageProxy,
  viewport: PageViewport,
  canvas: HTMLCanvasElement,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const content = await page.getTextContent();
  const textItems: PdfTextItem[] = [];

  for (const item of content.items) {
    if (!("str" in item)) {
      continue;
    }
    textItems.push({
      str: item.str,
      transform: item.transform,
      width: item.width,
    });
  }

  const lines = new Map<number, PdfTextItem[]>();
  for (const item of textItems) {
    const lineKey = Math.round(item.transform[5] * 4);
    const bucket = lines.get(lineKey) ?? [];
    bucket.push(item);
    lines.set(lineKey, bucket);
  }

  for (const lineItems of lines.values()) {
    const sorted = [...lineItems].sort((a, b) => a.transform[4] - b.transform[4]);
    let merged = "";
    const segments: LineSegment[] = [];

    for (const item of sorted) {
      const start = merged.length;
      merged += item.str;
      segments.push({ item, start, end: merged.length });
    }

    redactSensitiveOnLine(ctx, segments, merged, viewport);
  }
}

/**
 * Bottom Y (layout px from top of page 1) of the “PREÇO TOTAL” block in pdf.pdf.
 * Stops before the “Voos” section.
 */
async function measureTotalSectionBottomLayoutPx(
  page: PDFPageProxy,
  layoutWidth: number,
  pixelRatio: number,
): Promise<number | null> {
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({
    scale: (layoutWidth * pixelRatio) / base.width,
  });
  const content = await page.getTextContent();

  let totalHeaderLayoutY: number | null = null;
  let voosLayoutY: number | null = null;

  for (const raw of content.items) {
    if (!("str" in raw)) {
      continue;
    }

    const text = raw.str.trim();
    if (!text) {
      continue;
    }

    const [vx, vy] = viewport.convertToViewportPoint(
      raw.transform[4],
      raw.transform[5],
    );
    const layoutY = vy / pixelRatio;

    if (/preço\s+total/i.test(text)) {
      totalHeaderLayoutY =
        totalHeaderLayoutY === null
          ? layoutY
          : Math.min(totalHeaderLayoutY, layoutY);
    }

    if (/^voos$/i.test(text)) {
      voosLayoutY =
        voosLayoutY === null ? layoutY : Math.min(voosLayoutY, layoutY);
    }
  }

  if (totalHeaderLayoutY === null) {
    return null;
  }

  const sectionEndY = voosLayoutY ?? totalHeaderLayoutY + layoutWidth * 0.35;
  let sectionBottom = totalHeaderLayoutY;

  for (const raw of content.items) {
    if (!("str" in raw)) {
      continue;
    }

    const text = raw.str.trim();
    if (!text) {
      continue;
    }

    const [vx, vy] = viewport.convertToViewportPoint(
      raw.transform[4],
      raw.transform[5],
    );
    const layoutY = vy / pixelRatio;
    const layoutX = vx / pixelRatio;

    if (layoutY < totalHeaderLayoutY - 4 || layoutY >= sectionEndY - 6) {
      continue;
    }

    const lineHeight =
      ("height" in raw && typeof raw.height === "number"
        ? raw.height * (viewport.scale / pixelRatio)
        : 14) * 1.35;

    const inSummaryColumn = layoutX >= layoutWidth * 0.42;
    if (
      inSummaryColumn ||
      text.includes("€") ||
      /regime|partida|regresso|sinal/i.test(text)
    ) {
      sectionBottom = Math.max(sectionBottom, layoutY + lineHeight);
    }
  }

  return Math.ceil(sectionBottom + 10);
}

type PropostaPdfPrintProps = {
  onShowcaseFinished?: () => void;
};

export default function PropostaPdfPrint({
  onShowcaseFinished,
}: PropostaPdfPrintProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
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
      const next = Math.min(width / DESIGN_W, height / DESIGN_H);
      setScale((current) =>
        Math.abs(current - next) < 0.01 ? current : next,
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    const track = trackRef.current;
    if (!card || !track) {
      return;
    }

    let cancelled = false;
    let animation: Animation | null = null;
    let scrollDelayTimer: number | null = null;
    let loadingTask: { destroy: () => Promise<void> } | null = null;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const paint = async (layoutWidth: number) => {
      const pdfjs = await import("pdfjs-dist");
      if (cancelled) {
        return;
      }

      pdfjs.GlobalWorkerOptions.workerSrc = WORKER_URL;

      const task = pdfjs.getDocument({ url: PDF_URL });
      loadingTask = task;
      const doc = await task.promise;
      loadingTask = null;

      if (cancelled) {
        void doc.cleanup().catch(() => undefined);
        return;
      }

      const pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        PDF_RENDER_MAX_DPR,
      );
      track.replaceChildren();

      let totalSectionBottomPx: number | null = null;

      const beginScroll = () => {
        if (scrollDelayTimer !== null || animation || cancelled) {
          return;
        }

        const firstPage = track.querySelector("canvas");
        const headerSkip = firstPage
          ? Math.round(firstPage.clientHeight * HEADER_SKIP_RATIO)
          : 0;
        const startY = -headerSkip;
        const viewportHeight = card.clientHeight;

        let endY = startY;
        if (totalSectionBottomPx !== null && totalSectionBottomPx > 0) {
          endY = Math.min(startY, viewportHeight - totalSectionBottomPx);
        }

        const scrollDistance = Math.abs(endY - startY);

        track.classList.add(styles.trackReady);
        track.style.transform = `translate3d(0, ${startY}px, 0)`;

        const notifyShowcaseFinished = () => {
          if (!cancelled) {
            onShowcaseFinishedRef.current?.();
          }
        };

        if (reducedMotion || scrollDistance <= 1) {
          scrollDelayTimer = window.setTimeout(() => {
            scrollDelayTimer = null;
            notifyShowcaseFinished();
          }, PDF_SCROLL_DELAY_MS);
          return;
        }

        const duration = Math.min(
          PDF_SCROLL_MS_MAX,
          Math.max(PDF_SCROLL_MS_MIN, scrollDistance * PDF_SCROLL_MS_PER_PX),
        );

        scrollDelayTimer = window.setTimeout(() => {
          scrollDelayTimer = null;
          if (cancelled) {
            return;
          }

          animation = track.animate(
            [
              { transform: `translate3d(0, ${startY}px, 0)` },
              { transform: `translate3d(0, ${endY}px, 0)` },
            ],
            {
              duration,
              easing: "cubic-bezier(0.42, 0, 0.18, 1)",
              fill: "forwards",
            },
          );

          void animation.finished
            .then(() => {
              notifyShowcaseFinished();
            })
            .catch(() => undefined);
        }, PDF_SCROLL_DELAY_MS);
      };

      let scrollStarted = false;

      for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
        const page = await doc.getPage(pageNumber);
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({
          scale: (layoutWidth * pixelRatio) / base.width,
        });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const displayHeight = Math.round(
          layoutWidth * (base.height / base.width),
        );
        canvas.style.width = `${layoutWidth}px`;
        canvas.style.height = `${displayHeight}px`;
        canvas.className = styles.page;
        canvas.setAttribute("aria-hidden", "true");

        await page.render({ canvas, viewport }).promise;
        await scrubSensitiveFromCanvas(page, viewport, canvas);

        if (cancelled) {
          void doc.cleanup().catch(() => undefined);
          return;
        }

        track.appendChild(canvas);

        if (pageNumber === 1) {
          totalSectionBottomPx = await measureTotalSectionBottomLayoutPx(
            page,
            layoutWidth,
            pixelRatio,
          );
        }

        if (!scrollStarted && pageNumber === 1) {
          requestAnimationFrame(() => {
            beginScroll();
            scrollStarted = true;
          });
        }
      }

      void doc.cleanup().catch(() => undefined);

      if (cancelled) {
        return;
      }

      if (!scrollStarted) {
        beginScroll();
      }
    };

    const start = () => {
      // Layout width (not getBoundingClientRect): canvas CSS is 100% of the card
      // inside a scaled sheet — using screen px under-renders and looks soft.
      const layoutWidth = card.clientWidth;
      if (layoutWidth <= 0) {
        return false;
      }

      void paint(layoutWidth);
      return true;
    };

    let resizeObserver: ResizeObserver | null = null;

    if (!start()) {
      resizeObserver = new ResizeObserver(() => {
        if (start()) {
          resizeObserver?.disconnect();
          resizeObserver = null;
        }
      });
      resizeObserver.observe(card);
    }

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      if (scrollDelayTimer !== null) {
        window.clearTimeout(scrollDelayTimer);
      }
      animation?.cancel();
      void loadingTask?.destroy().catch(() => undefined);
    };
  }, [scale]);

  return (
    <div
      className={styles.root}
      role="img"
      aria-label="Pré-visualização da proposta em PDF, a percorrer o documento de cima para baixo"
    >
      <div className={styles.scaleHost} ref={hostRef}>
        <div
          className={styles.sheet}
          style={{ transform: `scale(${scale})` }}
        >
          <div className={styles.card} ref={cardRef}>
            <div ref={trackRef} className={styles.track} />
          </div>
        </div>
      </div>
    </div>
  );
}
