"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore, currentWeekMonday } from "@/lib/store";
import { weekDates, addDays, formatTime, parseISODate, todayISO, isToday } from "@/lib/date";
import { DogAvatar } from "@/components/ui";
import { IconPlus, IconChevron, IconChevronLeft, IconCopyWeek, IconCalendarSmall } from "@/components/icons";

const WEEKDAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEKDAYS_SHORT = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function fmtDay(s: string) {
  const d = parseISODate(s);
  return `${WEEKDAYS_FULL[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}
function weekRangeLabel(days: string[]) {
  const a = parseISODate(days[0]);
  const b = parseISODate(days[6]);
  const left = `${MONTHS[a.getMonth()]} ${a.getDate()}`;
  const right =
    a.getMonth() === b.getMonth()
      ? `${b.getDate()}, ${b.getFullYear()}`
      : `${MONTHS[b.getMonth()]} ${b.getDate()}, ${b.getFullYear()}`;
  return `${left} – ${right}`;
}

export default function SchedulePage() {
  const { walksForDate, getDog, getClient, copyWeek } = useStore();
  const [monday, setMonday] = useState<string>(currentWeekMonday());
  const [banner, setBanner] = useState<string>("");

  const days = useMemo(() => weekDates(monday), [monday]);

  const defaultSelected = days.find((d) => isToday(d)) ?? days[0];
  const [selected, setSelected] = useState<string>(defaultSelected);
  const [expanded, setExpanded] = useState<Set<string>>(new Set([defaultSelected]));

  // When the visible week changes, re-anchor the selection.
  const [anchoredMonday, setAnchoredMonday] = useState(monday);
  if (anchoredMonday !== monday) {
    const sel = days.find((d) => isToday(d)) ?? days[0];
    setAnchoredMonday(monday);
    setSelected(sel);
    setExpanded(new Set([sel]));
  }

  const toggle = (d: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });

  const pickDay = (d: string) => {
    setSelected(d);
    setExpanded((prev) => new Set(prev).add(d));
    const el = document.getElementById(`day-${d}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCopyPrev = () => {
    const count = copyWeek(addDays(monday, -7), monday);
    setBanner(count > 0 ? `Copied ${count} walk${count === 1 ? "" : "s"} from last week.` : "Last week had no walks to copy.");
    setTimeout(() => setBanner(""), 3500);
  };

  return (
    <div className="min-h-[100dvh]">
      {/* Header */}
      <header className="px-5 pt-4 pb-2 sticky top-0 z-20 bg-cream/90 backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-[32px] leading-none font-extrabold text-charcoal">This Week</h1>
            <div className="mt-1.5 flex items-center gap-1.5 text-[14px] text-muted">
              <button onClick={() => setMonday(addDays(monday, -7))} aria-label="Previous week" className="h-6 w-6 -ml-1 flex items-center justify-center rounded-full active:bg-beige/60 text-charcoal/70">
                <IconChevronLeft width={16} height={16} />
              </button>
              <span>{weekRangeLabel(days)}</span>
              <button onClick={() => setMonday(addDays(monday, 7))} aria-label="Next week" className="h-6 w-6 flex items-center justify-center rounded-full active:bg-beige/60 text-charcoal/70">
                <IconChevron width={16} height={16} />
              </button>
              {monday !== currentWeekMonday() && (
                <button onClick={() => setMonday(currentWeekMonday())} className="ml-1 text-[12px] font-semibold text-sage">
                  This week
                </button>
              )}
            </div>
          </div>
          <Link
            href={`/walks/new?date=${selected}`}
            aria-label="Add walk"
            className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full border bg-warmwhite border-beige text-charcoal active:bg-beige/60 mt-1"
          >
            <IconPlus width={20} height={20} />
          </Link>
        </div>
      </header>

      <div className="px-5 pt-1">
        {/* Copy previous week */}
        <button
          onClick={handleCopyPrev}
          className="w-full flex items-center justify-center gap-2 rounded-2xl h-[54px] text-[15px] font-semibold text-[#5c7249]"
          style={{ backgroundColor: "#FBF8F0", border: "1px solid #E6DDD0" }}
        >
          <IconCopyWeek width={18} height={18} /> Copy previous week
        </button>
        {banner && (
          <div className="mt-2 text-center text-[13px] text-[#4c6140] bg-sage/20 rounded-xl py-2 px-3">{banner}</div>
        )}

        {/* Week strip */}
        <div className="mt-3 grid grid-cols-7 gap-1.5">
          {days.map((d) => {
            const count = walksForDate(d).length;
            const isSel = d === selected;
            return (
              <button
                key={d}
                onClick={() => pickDay(d)}
                className="rounded-2xl py-2 flex flex-col items-center transition-colors"
                style={
                  isSel
                    ? { backgroundColor: "#8FA77D", color: "#fff" }
                    : { backgroundColor: "#FFFDF8", border: "1px solid #EBE3D5" }
                }
              >
                <span className={`text-[10px] font-bold tracking-wide ${isSel ? "text-white/85" : "text-muted"}`}>
                  {WEEKDAYS_SHORT[parseISODate(d).getDay()]}
                </span>
                <span className={`font-display text-[17px] font-extrabold leading-tight ${isSel ? "text-white" : "text-charcoal"}`}>
                  {parseISODate(d).getDate()}
                </span>
                <span className={`text-[10px] mt-0.5 ${isSel ? "text-white/85" : count ? "text-[#5c7249]" : "text-muted/70"}`}>
                  {count} walk{count === 1 ? "" : "s"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Day accordions */}
        <div className="mt-4 space-y-3">
          {days.map((d) => {
            const dayWalks = walksForDate(d);
            const open = expanded.has(d);
            return (
              <section
                key={d}
                id={`day-${d}`}
                className="rounded-2xl overflow-hidden scroll-mt-24"
                style={{ backgroundColor: "#FFFDF8", border: "1px solid #EBE3D5" }}
              >
                <button
                  onClick={() => toggle(d)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-3.5 text-left"
                >
                  <span className="flex items-center gap-2">
                    <span className="font-display text-[16px] font-bold text-charcoal">{fmtDay(d)}</span>
                    {isToday(d) && (
                      <span className="chip !py-0.5 !px-2 text-[11px]" style={{ backgroundColor: "#F0E4C4", color: "#8a6d1f" }}>Today</span>
                    )}
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span
                      className="chip !py-0.5 !px-2.5 text-[12px] font-semibold"
                      style={
                        dayWalks.length
                          ? { backgroundColor: "#E4EDDB", color: "#4c6140" }
                          : { backgroundColor: "#EFE7D8", color: "#8b7a5e" }
                      }
                    >
                      {dayWalks.length} walk{dayWalks.length === 1 ? "" : "s"}
                    </span>
                    <IconChevron
                      width={18}
                      height={18}
                      className={`text-muted transition-transform ${open ? "rotate-90" : ""}`}
                    />
                  </span>
                </button>

                {open && (
                  <div className="px-3 pb-3">
                    {dayWalks.length === 0 ? (
                      <Link
                        href={`/walks/new?date=${d}`}
                        className="flex flex-col items-center justify-center gap-1 rounded-xl py-6 text-center"
                        style={{ border: "1.5px dashed #DCD2C1", backgroundColor: "#FBF6EA" }}
                      >
                        <IconCalendarSmall width={22} height={22} className="text-muted" />
                        <span className="text-[14px] font-semibold text-charcoal">No walks scheduled</span>
                        <span className="text-[13px] text-muted">Tap to add a walk</span>
                      </Link>
                    ) : (
                      <>
                        <div>
                          {dayWalks.map((w, i) => (
                            <WeekRow key={w.id} walkId={w.id} first={i === 0} last={i === dayWalks.length - 1} />
                          ))}
                        </div>
                        <Link
                          href={`/walks/new?date=${d}`}
                          className="mt-1 flex items-center justify-center gap-1.5 py-2.5 text-[14px] font-semibold text-[#5c7249] active:opacity-70"
                        >
                          <IconPlus width={16} height={16} /> Add walk
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WeekRow({ walkId, first, last }: { walkId: string; first: boolean; last: boolean }) {
  const router = useRouter();
  const { getWalk, getDog, getClient } = useStore();
  const walk = getWalk(walkId);
  if (!walk) return null;
  const dog = getDog(walk.dog_id);
  const client = getClient(walk.client_id);
  const [h, m] = walk.scheduled_start_time.split(":");
  const hour12 = ((Number(h) + 11) % 12) + 1;
  const ampm = Number(h) >= 12 ? "PM" : "AM";
  const canceled = walk.status === "canceled" || walk.status === "skipped";

  return (
    <button onClick={() => router.push(`/walks/edit?id=${walk.id}`)} className="w-full flex items-center gap-2.5 text-left px-1 py-1.5">
      <div className="w-[46px] text-right shrink-0">
        <div className="text-[13px] font-bold leading-none text-charcoal">{hour12}:{m}</div>
        <div className="text-[10px] text-muted mt-0.5">{ampm}</div>
      </div>
      <div className="relative w-3 shrink-0 self-stretch">
        {!first && <span className="absolute left-1/2 -translate-x-1/2 top-0 h-1/2 w-[2px]" style={{ backgroundColor: "#EBE3D5" }} />}
        {!last && <span className="absolute left-1/2 -translate-x-1/2 bottom-0 h-1/2 w-[2px]" style={{ backgroundColor: "#EBE3D5" }} />}
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full" style={{ backgroundColor: "#CFC6B6" }} />
      </div>
      <DogAvatar name={dog?.name ?? "?"} photo={dog?.photo_url} size={38} />
      <div className="flex-1 min-w-0">
        <div className={`font-display font-bold text-[16px] leading-tight truncate ${canceled ? "text-muted line-through" : "text-charcoal"}`}>
          {dog?.name ?? "Unknown"}
        </div>
        <div className="text-[12px] text-muted truncate">{client?.owner_name ?? ""}</div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[13px] text-muted whitespace-nowrap">{walk.duration_minutes} min</span>
        <IconChevron width={15} height={15} className="text-muted" />
      </div>
    </button>
  );
}
