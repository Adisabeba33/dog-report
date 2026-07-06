import type { WalkReport, Dog, Settings } from "./types";
import { formatLongDate, formatTime } from "./date";

// Build the plain-text version of a report for the "Copy Text" / share-text
// actions. Private notes are intentionally never included.
export function buildReportText(
  report: WalkReport,
  dog: Dog | undefined,
  settings: Settings,
): string {
  const name = dog?.name ?? "Your dog";
  const lines: string[] = [];
  lines.push(`${name}'s Walk Report`);
  lines.push(formatLongDate(report.date));
  const times =
    report.actual_start_time && report.actual_end_time
      ? `${formatTime(report.actual_start_time)} – ${formatTime(report.actual_end_time)}`
      : "";
  const dur = report.actual_duration_minutes
    ? `${report.actual_duration_minutes} min walk`
    : "";
  lines.push([times, dur].filter(Boolean).join(" · "));
  lines.push("");
  if (report.mood) lines.push(`Mood: ${report.mood}`);
  if (report.energy) lines.push(`Energy: ${report.energy}`);
  lines.push(
    `Pee: ${yn(report.pee)}   Poop: ${yn(report.poop)}   Water: ${yn(report.water)}   Food: ${yn(report.food)}`,
  );
  if (report.public_note) {
    lines.push("");
    lines.push(report.public_note);
  }
  const sig = settings.default_signature || "Sent with care";
  const biz = settings.business_name ? ` ${settings.business_name}` : "";
  lines.push("");
  lines.push(sig.includes(settings.business_name) || !settings.business_name ? sig : `${sig} by${biz}`);
  return lines.join("\n");
}

function yn(v: boolean): string {
  return v ? "Yes" : "No";
}

export function reportSignature(settings: Settings): string {
  if (settings.default_signature && settings.business_name) {
    if (settings.default_signature.toLowerCase().includes(settings.business_name.toLowerCase())) {
      return settings.default_signature;
    }
    return `${settings.default_signature} by ${settings.business_name}`;
  }
  if (settings.default_signature) return settings.default_signature;
  if (settings.business_name) return `Sent with care by ${settings.business_name}`;
  return "Sent with care";
}
