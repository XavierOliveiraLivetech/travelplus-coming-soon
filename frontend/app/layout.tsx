import { basePath } from "@/lib/basePath";
import type { Metadata, Viewport } from "next";
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
  const fontUrl = `${basePath}/Fonts/Geist-VariableFont_wght.ttf`;

  return (
    <html lang="pt">
      <head>
        <style>{`
          @font-face {
            font-family: "Geist";
            src: url("${fontUrl}") format("truetype");
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
