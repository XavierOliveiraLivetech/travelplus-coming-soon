import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "..", "public", "Video");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "PesquisaHilton.mp4");

const SEARCH_URL =
  "https://livetrip.travelplus.pt/pesquisa/step1?cod_cidade=23&destino=23&destinoLabel=Ilha+do+Sal&origem=LIS&ida=2027-01-10&noites=7&adultos=2&criancas=0&pessoas=30%2C30&data=2027-01-10&ps=e2adaaee&uuid=a617d909-e59d-4e1e-a2ae-b071d4c72780";

const VIEWPORT = { width: 1280, height: 720 };

/** Pause between on-card actions (calm pacing for the demo video). */
const CALM_MS = 1_600;
const HOLD_END_MS = 2_200;

/** @param {import('playwright').Page} page */
async function clickHiltonControl(page, labelRe) {
  return page.evaluate((patternSource) => {
    const labelRe = new RegExp(patternSource, "i");
    const heading = [...document.querySelectorAll("h3")].find((el) =>
      /Hilton Cabo Verde Resort/i.test(el.textContent ?? ""),
    );
    if (!heading) {
      return false;
    }

    let node = heading;
    let card = heading;
    for (let depth = 0; depth < 24 && node; depth += 1) {
      const className = String(node.className ?? "");
      if (className.includes("HotelResultCard")) {
        card = node;
      }
      node = node.parentElement;
    }

    const button = [...card.querySelectorAll("button")].find((btn) => {
      const label =
        btn.getAttribute("aria-label")?.trim() ||
        btn.textContent?.trim() ||
        "";
      return labelRe.test(label);
    });

    if (!button) {
      return false;
    }

    button.scrollIntoView({ block: "center", behavior: "instant" });
    button.click();
    return true;
  }, labelRe.source);
}

/** @param {import('playwright').Page} page */
async function acceptCookiesIfPresent(page) {
  const acceptCookies = page.getByRole("button", { name: /Aceitar todos/i });
  await acceptCookies.waitFor({ state: "visible", timeout: 25_000 }).catch(() => undefined);
  if (await acceptCookies.isVisible().catch(() => false)) {
    await acceptCookies.click();
    await page.waitForTimeout(400);
  }
}

/** @param {import('playwright').Page} page */
async function waitForHiltonAndResults(page) {
  const repeatBtn = page.locator('button:has-text("Pesquisar novamente")').first();
  const search = page.getByRole("button", { name: "Pesquisar", exact: true });
  const hiltonHeading = page.getByRole("heading", {
    name: /Hilton Cabo Verde Resort/i,
  });

  if (await repeatBtn.isVisible({ timeout: 8_000 }).catch(() => false)) {
    await repeatBtn.click();
    await page.waitForTimeout(700);
  }

  if (!(await hiltonHeading.isVisible({ timeout: 12_000 }).catch(() => false))) {
    if (await search.isEnabled({ timeout: 5_000 }).catch(() => false)) {
      await search.click();
    }
  }

  await hiltonHeading.waitFor({ state: "visible", timeout: 240_000 });
  await page.waitForTimeout(600);
}

/** @param {import('playwright').Page} page */
async function centerHiltonCard(page) {
  await page.evaluate(() => {
    const heading = [...document.querySelectorAll("h3")].find((el) =>
      /Hilton Cabo Verde Resort/i.test(el.textContent ?? ""),
    );
    if (!heading) {
      return;
    }

    let node = heading;
    let card = heading;
    for (let depth = 0; depth < 24 && node; depth += 1) {
      const className = String(node.className ?? "");
      if (className.includes("HotelResultCard")) {
        card = node;
      }
      node = node.parentElement;
    }

    card.scrollIntoView({ block: "center", inline: "nearest" });
  });

  await page.waitForTimeout(900);
}

/** @param {import('playwright').Page} page */
async function clickHiltonSóAlojamentoRooms(page) {
  return page.evaluate(() => {
    const heading = [...document.querySelectorAll("h3")].find((el) =>
      /Hilton Cabo Verde Resort/i.test(el.textContent ?? ""),
    );
    if (!heading) {
      return false;
    }

    let node = heading;
    let card = heading;
    for (let depth = 0; depth < 24 && node; depth += 1) {
      const className = String(node.className ?? "");
      if (className.includes("HotelResultCard")) {
        card = node;
      }
      node = node.parentElement;
    }

    const regimeTitles = [...card.querySelectorAll("*")].filter((el) => {
      const text = el.textContent?.trim() ?? "";
      return /^Só alojamento$/i.test(text);
    });

    for (const title of regimeTitles) {
      let block = title.parentElement;
      for (let i = 0; i < 14 && block && card.contains(block); i += 1) {
        const roomBtn = [...block.querySelectorAll("button")].find((btn) =>
          /(?:Mais\s+)?\d+\s+quartos neste regime/i.test(btn.textContent ?? ""),
        );
        if (roomBtn) {
          roomBtn.scrollIntoView({ block: "center", behavior: "instant" });
          roomBtn.click();
          return true;
        }
        block = block.parentElement;
      }
    }

    return false;
  });
}

/** @param {import('playwright').Page} page */
async function recordHiltonDemo(page) {
  await waitForHiltonAndResults(page);
  await centerHiltonCard(page);
  await page.waitForTimeout(CALM_MS);

  const hasPhoto = await clickHiltonControl(page, /^Foto seguinte$/);
  if (!hasPhoto) {
    throw new Error('Hilton card: botão "Foto seguinte" não encontrado');
  }
  await page.waitForTimeout(CALM_MS);

  const hasRegime = await clickHiltonControl(page, /^Regimes seguintes$/);
  if (!hasRegime) {
    throw new Error('Hilton card: botão "Regimes seguintes" não encontrado');
  }
  await page.waitForTimeout(CALM_MS);

  const expanded = await clickHiltonSóAlojamentoRooms(page);
  if (!expanded) {
    throw new Error('Could not open "Só alojamento" — quartos neste regime');
  }

  await page.waitForTimeout(HOLD_END_MS);
}

async function prepareSession(browser) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    locale: "pt-PT",
  });
  const page = await context.newPage();

  await page.goto(SEARCH_URL, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await acceptCookiesIfPresent(page);
  await waitForHiltonAndResults(page);
  await centerHiltonCard(page);

  const storageState = await context.storageState();
  await context.close();
  return storageState;
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const storageState = await prepareSession(browser);

  const context = await browser.newContext({
    viewport: VIEWPORT,
    storageState,
    recordVideo: {
      dir: OUTPUT_DIR,
      size: VIEWPORT,
    },
    locale: "pt-PT",
  });
  const page = await context.newPage();

  await page.goto(SEARCH_URL, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await recordHiltonDemo(page);

  const video = page.video();
  await context.close();
  await browser.close();

  if (!video) {
    throw new Error("No video recorded");
  }

  const webmPath = await video.path();
  if (fs.existsSync(OUTPUT_FILE)) {
    fs.unlinkSync(OUTPUT_FILE);
  }
  const webmOut = OUTPUT_FILE.replace(/\.mp4$/i, ".webm");
  if (fs.existsSync(webmOut)) {
    fs.unlinkSync(webmOut);
  }
  fs.renameSync(webmPath, webmOut);

  const pwRoot = path.join(process.env.LOCALAPPDATA ?? "", "ms-playwright");
  let ffmpeg = null;
  if (fs.existsSync(pwRoot)) {
    for (const name of fs.readdirSync(pwRoot)) {
      if (!name.startsWith("ffmpeg-")) {
        continue;
      }
      const candidate = path.join(pwRoot, name, "ffmpeg.exe");
      if (fs.existsSync(candidate)) {
        ffmpeg = candidate;
        break;
      }
    }
  }

  if (ffmpeg) {
    const { spawnSync } = await import("node:child_process");
    const result = spawnSync(
      ffmpeg,
      [
        "-y",
        "-i",
        webmOut,
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        OUTPUT_FILE,
      ],
      { stdio: "inherit" },
    );
    if (result.status === 0 && fs.existsSync(OUTPUT_FILE)) {
      console.log(`Saved ${OUTPUT_FILE}`);
    } else {
      console.log(`Saved ${webmOut}`);
    }
  } else {
    console.log(`Saved ${webmOut}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
