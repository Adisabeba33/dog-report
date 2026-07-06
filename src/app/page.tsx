"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { IconPaw } from "@/components/icons";

// Client-side redirect to the daily work screen. (A server redirect() can't
// be used with static export.)
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/today");
  }, [router]);
  return (
    <div className="min-h-[100dvh] flex items-center justify-center text-sage">
      <div className="animate-pulse">
        <IconPaw width={48} height={48} />
      </div>
    </div>
  );
}
