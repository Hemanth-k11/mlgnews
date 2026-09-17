import "./globals.css";
import { Suspense } from "react";
import TopLoader from "@/components/TopLoader";

export const metadata = {
  title: {
    default: "Miryalaguda Chronicle — News, India and the World",
    template: "%s — Miryalaguda Chronicle",
  },
  description:
    "Miryalaguda Chronicle: independent reporting on India, the world, business, sport, science and culture.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts load here so a slow build never blocks on them.
            If the fonts don't load, the CSS falls back to Georgia / system sans. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&family=Noto+Serif:wght@400;600;700&display=swap"
        />
      </head>
      <body>
        <Suspense fallback={null}>
          <TopLoader />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
