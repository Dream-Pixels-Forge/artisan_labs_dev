import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/error-boundary";
import { SmoothScroll } from "@/components/smooth-scroll";
import { validateEnv } from "@/lib/validate-env";
import { Analytics } from '@vercel/analytics/next';

// Validate environment at build time
if (typeof window === 'undefined') {
  validateEnv()
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
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased bg-[#0a0a0a] text-[#f0f0f0]`}
      >
        <ErrorBoundary>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </ErrorBoundary>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
