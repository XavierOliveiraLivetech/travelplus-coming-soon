/**
 * Generates the WebP copies of public/ images that the page serves.
 * Originals stay in public/ as the source of truth; re-run after replacing one:
 *
 *   npm run optimize:images
 *
 * Sizes: the background photo keeps its 1920x1080 resolution (quality 90,
 * PSNR ~40 dB vs the JPEG). Logos are downscaled to 2-4x the largest box they
 * are drawn in (measured at a 3840px viewport), at the size that best keeps
 * their exact aspect ratio, and saved lossless, so they stay sharp on retina
 * screens. The hotel photos stay JPEG: WebP at equal quality saved almost nothing.
 */
import { statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public");

/** [source, max width or null to keep size, mode] */
const IMAGES = [
  ["Img/Background.jpg", null, "photo"],
  ["brand/logo-mark.png", 240, "logo"],
  ["Logos/Livetech.png", 480, "logo"],
  ["operators/newblue.png", 432, "logo"],
  ["operators/nortravel.png", 432, "logo"],
  ["operators/solferias.png", 432, "logo"],
  ["operators/soltour.png", 432, "logo"],
  ["operators/soltropico.png", 432, "logo"],
  ["operators/travelplan.png", 432, "logo"],
  ["operators/tui.png", 432, "logo"],
  ["operators/viajartours.png", 432, "logo"],
];

function closestRatioSize(width, height, minWidth) {
  const ratio = width / height;
  let best = { width, height, error: Infinity };
  for (let w = minWidth; w <= Math.min(width, Math.ceil(minWidth * 1.5)); w++) {
    const h = Math.round(w / ratio);
    const error = Math.abs(w / h - ratio) / ratio;
    if (error < best.error) best = { width: w, height: h, error };
  }
  return { width: best.width, height: best.height };
}

for (const [src, maxWidth, mode] of IMAGES) {
  const input = path.join(publicDir, src);
  const output = input.replace(/\.(png|jpe?g)$/i, ".webp");
  let pipeline = sharp(input);
  if (maxWidth) {
    const { width, height } = await sharp(input).metadata();
    if (width > maxWidth) {
      // Logos are drawn with `width: auto` / `object-fit: contain`, so their
      // aspect ratio decides layout. Pick the size (>= maxWidth) whose rounded
      // height keeps the original ratio closest, to avoid sub-pixel shifts.
      const size = closestRatioSize(width, height, maxWidth);
      pipeline = pipeline.resize({ ...size, fit: "fill", kernel: "lanczos3" });
    }
  }
  pipeline =
    mode === "photo"
      ? pipeline.webp({ quality: 90, effort: 6, smartSubsample: true })
      : pipeline.webp({ lossless: true, effort: 6 });
  const before = statSync(input).size;
  const info = await pipeline.toFile(output);
  console.log(
    `${src.padEnd(28)} ${String(Math.round(before / 1024)).padStart(5)} KiB -> ${String(Math.round(info.size / 1024)).padStart(4)} KiB  (${info.width}x${info.height})`,
  );
}
