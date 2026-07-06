import type { Metadata, Viewport } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import AppChrome from "@/components/AppChrome";

const display = Manrope({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});
const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "Walk Report",
  description:
    "A fast, friendly work assistant for dog walkers — plan the week, complete walks, and send beautiful owner reports.",
  manifest: `${base}/manifest.webmanifest`,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Walk Report",
  },
  icons: {
    icon: `${base}/icon.svg`,
    apple: `${base}/apple-touch-icon.png`,
  },
};

export const viewport: Viewport = {
  themeColor: "#F8F3EA",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <StoreProvider>
          <AppChrome>{children}</AppChrome>
        </StoreProvider>
      </body>
    </html>
  );
}
