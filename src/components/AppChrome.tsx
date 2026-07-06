"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";
import { useStore } from "@/lib/store";
import { IconPaw } from "./icons";

// Routes that render full-screen without the bottom tab bar.
const FULLSCREEN_PREFIXES = ["/welcome", "/walks/", "/reports/"];

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { ready } = useStore();

  // Register the service worker for offline / add-to-home-screen. The scope
  // and script path respect the deploy base path (e.g. /dog-report on Pages).
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
      navigator.serviceWorker
        .register(`${base}/sw.js`, { scope: `${base}/` })
        .catch(() => {});
    }
  }, []);

  const hideNav =
    FULLSCREEN_PREFIXES.some((p) => pathname.startsWith(p)) &&
    // keep nav on the reports list itself
    pathname !== "/reports";

  if (!ready) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center text-sage">
        <div className="animate-pulse">
          <IconPaw width={48} height={48} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md min-h-[100dvh] relative">
      <div className={hideNav ? "" : "pb-nav"}>{children}</div>
      {!hideNav && <BottomNav />}
    </div>
  );
}
