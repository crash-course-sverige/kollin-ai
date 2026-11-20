import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import localFont from "next/font/local";

import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Aviano Sans: wordmark / rare brand moments only (see design system docs).
const aviano = localFont({
  src: "../../public/fonts/aviano-sans-regular.otf",
  variable: "--font-aviano-face",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Kollin",
    default: "Kollin",
  },
  description: "AI-native study platform for engineering students.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Keep browser chrome in step with the canvas in each mode.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F9F7F5" },
    { media: "(prefers-color-scheme: dark)", color: "#150A0B" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: next-themes sets the `dark` class before paint.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} ${aviano.variable} h-full`}
    >
      <head>
        {/* Kollin's Adobe Fonts kit (Proxima Nova Wide, display face).
            The kit only serves allow-listed domains; others fall back to Inter. */}
        <link rel="stylesheet" href="https://use.typekit.net/vai5tab.css" />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
