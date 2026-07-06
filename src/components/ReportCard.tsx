"use client";

import { forwardRef } from "react";
import type { WalkReport, Dog, Settings } from "@/lib/types";
import { formatLongDate, formatTime } from "@/lib/date";
import { reportSignature } from "@/lib/report";

// The premium, warm, owner-facing report card. Rendered on screen AND
// rasterized to a shareable PNG (~1080×1350) via html-to-image. Private
// notes are deliberately never referenced here.
const ReportCard = forwardRef<
  HTMLDivElement,
  { report: WalkReport; dog?: Dog; settings: Settings }
>(function ReportCard({ report, dog, settings }, ref) {
  const accent = settings.accent || "#9CAF88";
  const times =
    report.actual_start_time && report.actual_end_time
      ? `${formatTime(report.actual_start_time)} – ${formatTime(report.actual_end_time)}`
      : "";
  const dur = report.actual_duration_minutes ? `${report.actual_duration_minutes} min` : "";

  const stats: { label: string; value: string; strong?: boolean }[] = [
    { label: "Mood", value: report.mood || "—", strong: true },
    { label: "Energy", value: report.energy || "—", strong: true },
    { label: "Pee", value: yn(report.pee) },
    { label: "Poop", value: yn(report.poop) },
    { label: "Water", value: yn(report.water) },
    { label: "Food", value: yn(report.food) },
  ];

  return (
    <div
      ref={ref}
      style={{ width: 380, backgroundColor: "#F8F3EA", color: "#25221E" }}
      className="overflow-hidden rounded-[28px]"
    >
      {/* Photo header */}
      <div className="relative" style={{ height: report.photos[0] || dog?.photo_url ? 240 : 96 }}>
        {report.photos[0] || dog?.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={report.photos[0] || dog?.photo_url}
            alt={dog?.name ?? ""}
            className="h-full w-full object-cover"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="h-full w-full" style={{ backgroundColor: accent }} />
        )}
        <div
          className="absolute inset-x-0 bottom-0 h-24"
          style={{ background: "linear-gradient(to top, rgba(37,34,30,0.55), transparent)" }}
        />
        {settings.business_name && (
          <div className="absolute top-3 left-4 right-4 flex items-center gap-2">
            {settings.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.logo_url} alt="" className="h-7 w-7 rounded-full object-cover ring-2 ring-white/70" />
            )}
            <span className="text-[12px] font-semibold text-white/95 drop-shadow">
              {settings.business_name}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-6 pt-5 pb-6">
        <h1 className="font-display text-[26px] font-extrabold leading-tight">
          {dog?.name ?? "Your dog"}&rsquo;s Walk Report
        </h1>
        <p className="text-[14px] mt-1" style={{ color: "#8B6F56" }}>
          {formatLongDate(report.date)}
        </p>
        <div className="mt-1 flex items-center gap-2 text-[15px] font-semibold" style={{ color: "#25221E" }}>
          {times}
          {times && dur && <span style={{ color: accent }}>·</span>}
          {dur}
        </div>

        {/* Stat grid */}
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl px-4 py-3"
              style={{ backgroundColor: "#FFFDF8", border: "1px solid #E8DED0" }}
            >
              <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#8A8175" }}>
                {s.label}
              </div>
              <div
                className="font-display font-bold leading-tight mt-0.5"
                style={{
                  fontSize: s.strong ? 20 : 18,
                  color: s.value === "Yes" ? "#4c6140" : s.value === "No" ? "#8A8175" : "#25221E",
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        {report.public_note && (
          <div className="mt-5">
            <div className="text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: "#8A8175" }}>
              Note
            </div>
            <p className="text-[15px] leading-relaxed" style={{ color: "#25221E" }}>
              {report.public_note}
            </p>
          </div>
        )}

        {/* Extra photos */}
        {report.photos.length > 1 && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {report.photos.slice(1, 4).map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={p} alt="" className="aspect-square w-full object-cover rounded-xl" crossOrigin="anonymous" />
            ))}
          </div>
        )}

        {/* Signature */}
        <div className="mt-6 pt-4 flex items-center gap-2" style={{ borderTop: "1px solid #E8DED0" }}>
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[15px]"
            style={{ backgroundColor: accent, color: "#FFFDF8" }}
          >
            ♥
          </span>
          <span className="text-[13px]" style={{ color: "#8B6F56" }}>
            {reportSignature(settings)}
          </span>
        </div>
      </div>
    </div>
  );
});

function yn(v: boolean): string {
  return v ? "Yes" : "No";
}

export default ReportCard;
