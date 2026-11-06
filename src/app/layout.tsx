import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/error-boundary";
import { SmoothScroll } from "@/components/smooth-scroll";
import { assertEnv } from "@/lib/validate-env";
import { Analytics } from '@vercel/analytics/next';
import { StorageWarning } from '@/components/storage-warning';

// Validate environment at build time / server startup
if (typeof window === 'undefined') {
  assertEnv()
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Artisan Labs — Scrollytelling Sequence Optimizer",
  description:
    "Transform videos into optimized image sequences for stunning scrollytelling websites.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased bg-surface-0 text-foreground`}
      >
        <ErrorBoundary>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </ErrorBoundary>
        <Toaster />
        <StorageWarning />
        <Analytics />
      </body>
    </html>
  );
}
