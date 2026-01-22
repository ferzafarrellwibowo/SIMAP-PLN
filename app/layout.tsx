import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SIMAP - Sistem Informasi Monitoring Anggaran & Proyek",
  description: "Sistem Informasi Monitoring Anggaran & Proyek",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  // Light mode sebagai DEFAULT - hanya gunakan dark jika explicitly set
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* Favicon: sediakan beberapa link agar browser dapat memilih ukuran terbaik */}
        {/* SVG (scalable) */}
        <link rel="icon" href="/logoPLN1.svg" type="image/svg+xml" />
        {/* Hint ukuran - 'any' signals SVG scalable icons */}
        <link rel="icon" href="/logoPLN1.svg" sizes="any" />
        {/* Fallbacks - if you add PNG/ICO assets to /public, browsers can pick these for pixel-perfect sizes */}
        <link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48" />
        <link rel="icon" href="/logoPLN1-192.png" sizes="192x192" />
        {/* Apple / mobile */}
        <link rel="apple-touch-icon" href="/logoPLN1-180.png" />
        {/* Safari pinned tab (mask-icon prefers monochrome SVG) */}
        <link rel="mask-icon" href="/logoPLN1.svg" color="#000000" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
