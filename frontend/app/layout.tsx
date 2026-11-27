import { basePath } from "@/lib/basePath";
import type { Metadata, Viewport } from "next";
import { preload } from "react-dom";
import "./globals.css";

export const metadata: Metadata = {
  title: "Travel Plus — Brevemente",
  description:
    "A sua próxima aventura está prestes a começar. Registe o seu e-mail e acompanhe todas as novidades da Travel Plus.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // WOFF2 is the same font (identical tables and glyphs) at ~40% of the TTF size;
  // the TTF stays as a fallback.
  const fontUrl = `${basePath}/Fonts/Geist-VariableFont_wght.woff2`;
  const fontFallbackUrl = `${basePath}/Fonts/Geist-VariableFont_wght.ttf`;

  // Fetch the font alongside the CSS instead of after it is parsed.
  preload(fontUrl, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });

  return (
    <html lang="pt">
      <head>
        <style>{`
          @font-face {
            font-family: "Geist";
            src: url("${fontUrl}") format("woff2"),
              url("${fontFallbackUrl}") format("truetype");
            font-weight: 100 900;
            font-style: normal;
            font-display: swap;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
