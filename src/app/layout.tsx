import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "ChronoCircle | Pengatur Jadwal 24 Jam & Fokus Waktu Real-Time",
  description:
    "Aplikasi pengatur jadwal melingkar 24 jam interaktif dengan koordinat polar, pelacak aktivitas saat ini, magnetic snap, dan penyimpanan offline local-first di HP & desktop.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ChronoCircle",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  keywords: [
    "circular schedule",
    "jadwal 24 jam",
    "radial clock schedule",
    "time block productivity",
    "jadwal harian",
    "pwa offline schedule",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
        {children}
      </body>
    </html>
  );
}
