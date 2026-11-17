/**
 * Remux OBS "fragmented MP4" sneaks into progressive MP4 (moov before mdat)
 * so HTML5 <video> can play them via normal progressive download.
 *
 * Usage:
 *   node scripts/remux-sneaks.mjs
 *   node scripts/remux-sneaks.mjs path/to/input.mp4 path/to/output.mp4
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicSneaks = path.resolve(__dirname, "../public/sneaks");

function findFfmpeg() {
  const which = spawnSync(
    process.platform === "win32" ? "where" : "which",
    ["ffmpeg"],
    { encoding: "utf8" },
  );
  if (which.status === 0) {
    const first = which.stdout.trim().split(/\r?\n/)[0];
    if (first) return first;
  }

  try {
    const imageio = spawnSync(
      "python",
      ["-c", "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"],
      { encoding: "utf8" },
    );
    if (imageio.status === 0 && imageio.stdout.trim()) {
      return imageio.stdout.trim();
    }
  } catch {
    // fall through
  }

  throw new Error(
    "ffmpeg not found. Install ffmpeg or `pip install imageio-ffmpeg`.",
  );
}

function remux(ffmpeg, input, output) {
  if (!existsSync(input)) {
    throw new Error(`Missing input: ${input}`);
  }

  console.log(`Remuxing\n  from: ${input}\n  to:   ${output}`);
  const result = spawnSync(
    ffmpeg,
    ["-y", "-i", input, "-c", "copy", "-movflags", "+faststart", output],
    { encoding: "utf8" },
  );

  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    throw new Error(`ffmpeg failed for ${input}`);
  }

  console.log("OK");
}

const ffmpeg = findFfmpeg();
const args = process.argv.slice(2);

if (args.length >= 2) {
  remux(ffmpeg, path.resolve(args[0]), path.resolve(args[1]));
} else {
  const jobs = [
    {
      input: path.join(publicSneaks, "pesquisa-agrupada.mp4"),
      output: path.join(publicSneaks, "pesquisa-agrupada.mp4"),
    },
    {
      input: path.join(publicSneaks, "orcamento.mp4"),
      output: path.join(publicSneaks, "orcamento.mp4"),
    },
  ];

  for (const job of jobs) {
    if (!existsSync(job.input)) {
      console.warn(`Skip (missing): ${job.input}`);
      continue;
    }
    const tmp = `${job.output}.tmp.mp4`;
    remux(ffmpeg, job.input, tmp);
    spawnSync(
      process.platform === "win32" ? "cmd" : "mv",
      process.platform === "win32"
        ? ["/c", "move", "/y", tmp, job.output]
        : ["-f", tmp, job.output],
      { encoding: "utf8", shell: process.platform === "win32" },
    );
  }
}
