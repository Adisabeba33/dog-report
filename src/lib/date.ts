import type { ISODate, Time } from "./types";

// Date helpers work purely on local calendar dates to avoid timezone drift.

export function toISODate(d: Date): ISODate {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO(): ISODate {
  return toISODate(new Date());
}

export function parseISODate(s: ISODate): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(s: ISODate, days: number): ISODate {
  const d = parseISODate(s);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

// Monday-based start of the week for the given date.
export function startOfWeek(s: ISODate): ISODate {
  const d = parseISODate(s);
  const day = d.getDay(); // 0=Sun
  const diff = (day + 6) % 7; // days since Monday
  d.setDate(d.getDate() - diff);
  return toISODate(d);
}

export function weekDates(startMonday: ISODate): ISODate[] {
  return Array.from({ length: 7 }, (_, i) => addDays(startMonday, i));
}

const WEEKDAY_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function weekdayName(s: ISODate): string {
  return WEEKDAY_LONG[parseISODate(s).getDay()];
}

export function dayOfWeek(s: ISODate): number {
  return parseISODate(s).getDay();
}

// "July 6, 2026"
export function formatLongDate(s: ISODate): string {
  const d = parseISODate(s);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// "Mon, Jul 6"
export function formatShortDate(s: ISODate): string {
  const d = parseISODate(s);
  return `${WEEKDAY_LONG[d.getDay()].slice(0, 3)}, ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
}

// "9:00 AM" from "09:00"
export function formatTime(t: Time): string {
  if (!t) return "";
  const [hRaw, m] = t.split(":").map(Number);
  const ampm = hRaw >= 12 ? "PM" : "AM";
  let h = hRaw % 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
}

// Add minutes to a "HH:MM" time, clamped to same day.
export function addMinutesToTime(t: Time, minutes: number): Time {
  const [h, m] = t.split(":").map(Number);
  let total = h * 60 + m + minutes;
  total = Math.max(0, Math.min(total, 23 * 60 + 59));
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

export function minutesBetween(start: Time, end: Time): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return Math.max(0, eh * 60 + em - (sh * 60 + sm));
}

export function nowTime(): Time {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function isToday(s: ISODate): boolean {
  return s === todayISO();
}
