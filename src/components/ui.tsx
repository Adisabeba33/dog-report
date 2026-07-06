"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { WalkStatus } from "@/lib/types";
import { IconChevronLeft, IconPaw } from "./icons";

export function DogAvatar({
  name,
  photo,
  size = 56,
  className = "",
}: {
  name: string;
  photo?: string;
  size?: number;
  className?: string;
}) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={photo}
        alt={name}
        style={{ width: size, height: size }}
        className={`rounded-2xl object-cover bg-beige ${className}`}
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-2xl bg-sage/25 text-brown flex items-center justify-center font-display font-bold ${className}`}
    >
      <span style={{ fontSize: size * 0.4 }}>{initial}</span>
    </div>
  );
}

const STATUS_STYLES: Record<WalkStatus, string> = {
  scheduled: "bg-beige text-brown",
  in_progress: "bg-gold/25 text-[#8a6d1f]",
  completed: "bg-sage/25 text-[#4c6140]",
  canceled: "bg-red-100 text-red-700",
  skipped: "bg-neutral-200 text-neutral-600",
};
const STATUS_LABEL: Record<WalkStatus, string> = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  canceled: "Canceled",
  skipped: "Skipped",
};

export function StatusBadge({ status }: { status: WalkStatus }) {
  return (
    <span className={`chip ${STATUS_STYLES[status]}`}>
      {status === "in_progress" && (
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      )}
      {STATUS_LABEL[status]}
    </span>
  );
}

export function EmptyState({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="h-16 w-16 rounded-3xl bg-sage/20 text-sage flex items-center justify-center mb-4">
        <IconPaw width={34} height={34} />
      </div>
      <h3 className="font-display text-lg font-bold text-charcoal">{title}</h3>
      {subtitle && <p className="text-[15px] text-muted mt-1 max-w-xs">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
  back,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  back?: boolean | string;
}) {
  const router = useRouter();
  return (
    <header className="px-4 pt-3 pb-2 sticky top-0 z-20 bg-cream/85 backdrop-blur-md">
      <div className="flex items-center gap-2 min-h-[40px]">
        {back && (
          <button
            aria-label="Back"
            onClick={() => (typeof back === "string" ? router.push(back) : router.back())}
            className="-ml-1.5 mr-0.5 h-9 w-9 flex items-center justify-center rounded-full text-charcoal active:bg-beige/60"
          >
            <IconChevronLeft width={22} height={22} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-[22px] leading-tight font-extrabold text-charcoal truncate">
            {title}
          </h1>
          {subtitle && <p className="text-[13px] text-muted -mt-0.5">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}

export function Toggle({
  active,
  onChange,
  label,
}: {
  active: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!active)}
      className={`flex-1 rounded-xl py-3 text-[15px] font-semibold border transition-colors ${
        active
          ? "bg-sage text-charcoal border-sage"
          : "bg-warmwhite text-muted border-beige"
      }`}
    >
      {label}
    </button>
  );
}

export function Fab({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="fixed right-4 bottom-[calc(84px+env(safe-area-inset-bottom,0px))] z-30 btn btn-primary shadow-card !rounded-full !px-5 !py-3.5"
    >
      {label}
    </Link>
  );
}
