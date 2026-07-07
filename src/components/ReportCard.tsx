"use client";

import { forwardRef } from "react";
import type { WalkReport, Dog, Settings } from "@/lib/types";
import { formatLongDate, formatTime } from "@/lib/date";
import { reportSignature } from "@/lib/report";
import {
  IconSmile,
  IconBars,
  IconDroplet,
  IconWater,
  IconPoop,
  IconBowl,
  IconClock,
  IconQuote,
  IconHeart,
  IconPaw,
} from "./icons";

// Premium, owner-facing report card. Rendered on screen AND rasterized to a
// shareable PNG (~1080×1350) via html-to-image. Private notes are never shown.
const ReportCard = forwardRef<
  HTMLDivElement,
  { report: WalkReport; dog?: Dog; settings: Settings }
>(function ReportCard({ report, dog, settings }, ref) {
  const accent = "#5F754D";
  const heroPhoto = report.photos[0] || dog?.photo_url || "";
  const times =
    report.actual_start_time && report.actual_end_time
      ? `${formatTime(report.actual_start_time)} – ${formatTime(report.actual_end_time)}`
      : "";
  const dur = report.actual_duration_minutes ? `${report.actual_duration_minutes} min` : "";

  const tiles: { label: string; value: string; Icon: typeof IconSmile; yes?: boolean }[] = [
    { label: "Mood", value: report.mood || "—", Icon: IconSmile },
    { label: "Energy", value: report.energy || "—", Icon: IconBars },
    { label: "Pee", value: yn(report.pee), Icon: IconDroplet, yes: report.pee },
    { label: "Poop", value: yn(report.poop), Icon: IconPoop, yes: report.poop },
    { label: "Water", value: yn(report.water), Icon: IconWater, yes: report.water },
    { label: "Food", value: yn(report.food), Icon: IconBowl, yes: report.food },
  ];

  return (
    <div
      ref={ref}
      style={{ width: 380, backgroundColor: "#F8F3EA", color: "#25221E" }}
      className="overflow-hidden rounded-[28px]"
    >
      {/* Hero */}
      <div className="relative" style={{ height: heroPhoto ? 244 : 120 }}>
        {heroPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroPhoto} alt={dog?.name ?? ""} className="h-full w-full object-cover" crossOrigin="anonymous" />
        ) : (
          <div className="h-full w-full flex items-center justify-center" style={{ backgroundColor: "#8FA77D" }}>
            <span className="font-display text-5xl font-extrabold text-white/90">
              {(dog?.name ?? "?").charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        {/* brand badge */}
        <div
          className="absolute top-3.5 left-3.5 h-11 w-11 rounded-full flex items-center justify-center shadow-sm"
          style={{ backgroundColor: accent }}
        >
          {settings.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.logo_url} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            <IconPaw width={22} height={22} className="text-white" />
          )}
        </div>
      </div>

      {/* Content card */}
      <div className="relative -mt-6 rounded-t-[28px] bg-warmwhite px-5 pt-5 pb-6" style={{ backgroundColor: "#FFFDF8" }}>
        <h1 className="font-display text-[27px] leading-tight font-extrabold text-charcoal">
          {dog?.name ?? "Your dog"}&rsquo;s Walk Report
        </h1>
        <div className="mt-1.5 h-[3px] w-12 rounded-full" style={{ backgroundColor: accent }} />

        <div className="mt-2.5 text-[14px] font-semibold" style={{ color: "#9A7A4F" }}>
          {formatLongDate(report.date)}
        </div>
        {(times || dur) && (
          <div className="mt-1 flex items-center gap-1.5 text-[14px] text-charcoal">
            <IconClock width={15} height={15} className="text-muted" />
            <span>
              {times}
              {times && dur && <span style={{ color: accent }}> · </span>}
              {dur}
            </span>
          </div>
        )}

        {/* Stat tiles */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {tiles.map((t) => {
            const isNo = t.value === "No";
            const valColor = isNo ? "#8A8176" : accent;
            return (
              <div key={t.label} className="rounded-2xl px-2.5 py-2.5" style={{ backgroundColor: "#FFFDF8", border: "1px solid #E6DDD0" }}>
                <t.Icon width={16} height={16} style={{ color: isNo ? "#B7AE9E" : accent }} />
                <div className="mt-1 text-[10px] font-bold uppercase tracking-wide" style={{ color: "#8A8176" }}>
                  {t.label}
                </div>
                <div className="font-display text-[15px] font-bold leading-tight" style={{ color: valColor }}>
                  {t.value}
                </div>
              </div>
            );
          })}
        </div>

        {/* Note */}
        {report.public_note && (
          <div className="mt-4 flex gap-2.5 rounded-2xl p-3.5" style={{ backgroundColor: "#EAF0E2" }}>
            <span className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center" style={{ backgroundColor: accent }}>
              <IconQuote width={14} height={14} className="text-white" />
            </span>
            <p className="text-[14px] leading-relaxed text-charcoal">{report.public_note}</p>
          </div>
        )}

        {/* Extra photos */}
        {report.photos.length > 1 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {report.photos.slice(1, 4).map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={p} alt="" className="aspect-square w-full object-cover rounded-xl" crossOrigin="anonymous" />
            ))}
          </div>
        )}

        {/* Signature */}
        <div className="mt-4 flex items-center gap-2">
          <span className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#EAF0E2" }}>
            <IconHeart width={15} height={15} style={{ color: accent }} />
          </span>
          <span className="text-[13px]" style={{ color: "#9A7A4F" }}>{reportSignature(settings)}</span>
        </div>
      </div>
    </div>
  );
});

function yn(v: boolean): string {
  return v ? "Yes" : "No";
}

export default ReportCard;
