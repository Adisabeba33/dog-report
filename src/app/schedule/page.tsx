"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore, currentWeekMonday } from "@/lib/store";
import {
  weekDates,
  addDays,
  formatTime,
  formatLongDate,
  isToday,
  parseISODate,
} from "@/lib/date";
import { PageHeader, DogAvatar, StatusBadge } from "@/components/ui";
import {
  IconPlus,
  IconChevron,
  IconChevronLeft,
  IconCopyWeek,
} from "@/components/icons";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function SchedulePage() {
  const router = useRouter();
  const { db, walksForDate, getDog, getClient, copyWeek } = useStore();
  const [monday, setMonday] = useState<string>(currentWeekMonday());
  const [banner, setBanner] = useState<string>("");

  const days = useMemo(() => weekDates(monday), [monday]);
  const weekLabel = `${formatLongDate(days[0]).replace(/, \d{4}$/, "")} – ${formatLongDate(days[6])}`;
  const total = days.reduce((n, d) => n + walksForDate(d).length, 0);

  const handleCopyPrev = () => {
    const prevMonday = addDays(monday, -7);
    const count = copyWeek(prevMonday, monday);
    setBanner(
      count > 0
        ? `Copied ${count} walk${count === 1 ? "" : "s"} from last week.`
        : "Last week had no walks to copy.",
    );
    setTimeout(() => setBanner(""), 3500);
  };

  return (
    <div>
      <PageHeader title="This Week" subtitle={`${total} walk${total === 1 ? "" : "s"} planned`} />

      {/* Week navigator */}
      <div className="px-4 flex items-center gap-2">
        <button
          onClick={() => setMonday(addDays(monday, -7))}
          aria-label="Previous week"
          className="h-10 w-10 flex items-center justify-center rounded-xl bg-warmwhite border border-beige text-charcoal active:bg-beige/60"
        >
          <IconChevronLeft width={20} height={20} />
        </button>
        <div className="flex-1 text-center">
          <div className="font-display font-extrabold text-charcoal leading-tight text-[15px]">
            {weekLabel}
          </div>
          <button
            onClick={() => setMonday(currentWeekMonday())}
            className="text-[12px] text-sage font-semibold"
          >
            {monday === currentWeekMonday() ? "Current week" : "Jump to this week"}
          </button>
        </div>
        <button
          onClick={() => setMonday(addDays(monday, 7))}
          aria-label="Next week"
          className="h-10 w-10 flex items-center justify-center rounded-xl bg-warmwhite border border-beige text-charcoal active:bg-beige/60"
        >
          <IconChevron width={20} height={20} />
        </button>
      </div>

      {/* Copy previous week */}
      <div className="px-4 mt-3">
        <button onClick={handleCopyPrev} className="btn btn-ghost w-full">
          <IconCopyWeek width={18} height={18} /> Copy previous week
        </button>
        {banner && (
          <div className="mt-2 text-center text-[13px] text-[#4c6140] bg-sage/20 rounded-xl py-2 px-3">
            {banner}
          </div>
        )}
      </div>

      {/* Days */}
      <div className="px-4 mt-4 space-y-5">
        {days.map((d, i) => {
          const dayWalks = walksForDate(d);
          return (
            <section key={d}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h2 className="section-title">{WEEKDAYS[i]}</h2>
                  {isToday(d) && (
                    <span className="chip bg-gold/25 text-[#8a6d1f] !py-0.5 !px-2 text-[11px]">Today</span>
                  )}
                  <span className="text-[12px] text-muted">{parseISODate(d).getDate()}</span>
                </div>
                <Link
                  href={`/walks/new?date=${d}`}
                  className="text-sage active:opacity-70"
                  aria-label={`Add walk on ${WEEKDAYS[i]}`}
                >
                  <IconPlus width={20} height={20} />
                </Link>
              </div>

              {dayWalks.length === 0 ? (
                <Link
                  href={`/walks/new?date=${d}`}
                  className="block rounded-xl border border-dashed border-beige text-muted text-[13px] py-3 text-center active:bg-beige/30"
                >
                  No walks — tap to add
                </Link>
              ) : (
                <div className="space-y-2">
                  {dayWalks.map((w) => {
                    const dog = getDog(w.dog_id);
                    const client = getClient(w.client_id);
                    return (
                      <button
                        key={w.id}
                        onClick={() => router.push(`/walks/edit?id=${w.id}`)}
                        className="card w-full p-3 flex items-center gap-3 text-left active:bg-cream/40"
                      >
                        <div className="w-16 shrink-0">
                          <div className="font-display font-bold text-[13px] text-charcoal">
                            {formatTime(w.scheduled_start_time)}
                          </div>
                          <div className="text-[11px] text-muted">{w.duration_minutes} min</div>
                        </div>
                        <DogAvatar name={dog?.name ?? "?"} photo={dog?.photo_url} size={40} />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-charcoal truncate">{dog?.name}</div>
                          <div className="text-[12px] text-muted truncate">{client?.owner_name}</div>
                        </div>
                        <StatusBadge status={w.status} />
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
