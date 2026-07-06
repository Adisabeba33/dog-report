"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import {
  todayISO,
  addDays,
  isToday,
  formatShortDate,
  weekdayName,
  formatLongDate,
} from "@/lib/date";
import type { WalkStatus } from "@/lib/types";
import WalkCard from "@/components/WalkCard";
import { PageHeader, EmptyState } from "@/components/ui";
import { IconPlus, IconChevron, IconChevronLeft, IconSearch, IconSettings } from "@/components/icons";

const FILTERS: { key: WalkStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "scheduled", label: "Scheduled" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "canceled", label: "Canceled" },
];

export default function TodayPage() {
  const { db, walksForDate, getDog, getClient } = useStore();
  const [date, setDate] = useState<string>(todayISO());
  const [filter, setFilter] = useState<WalkStatus | "all">("all");
  const [query, setQuery] = useState("");

  const walks = useMemo(() => {
    let list = walksForDate(date);
    if (filter !== "all") list = list.filter((w) => w.status === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((w) => {
        const dog = getDog(w.dog_id);
        const client = getClient(w.client_id);
        return (
          dog?.name.toLowerCase().includes(q) ||
          client?.owner_name.toLowerCase().includes(q)
        );
      });
    }
    return list;
  }, [db, date, filter, query, walksForDate, getDog, getClient]);

  const nextUp = walks.find((w) => w.status === "scheduled" || w.status === "in_progress");
  const remaining = walksForDate(date).filter((w) => w.status === "scheduled").length;

  return (
    <div>
      <PageHeader
        title="Today"
        subtitle={db.settings.business_name || "Your walks at a glance"}
        right={
          <Link
            href="/settings"
            aria-label="Settings"
            className="h-9 w-9 flex items-center justify-center rounded-full text-charcoal active:bg-beige/60"
          >
            <IconSettings width={22} height={22} />
          </Link>
        }
      />

      {/* Date selector */}
      <div className="px-4 flex items-center gap-2">
        <button
          onClick={() => setDate(addDays(date, -1))}
          aria-label="Previous day"
          className="h-10 w-10 flex items-center justify-center rounded-xl bg-warmwhite border border-beige text-charcoal active:bg-beige/60"
        >
          <IconChevronLeft width={20} height={20} />
        </button>
        <div className="flex-1 text-center">
          <div className="font-display font-extrabold text-charcoal leading-tight">
            {isToday(date) ? "Today" : weekdayName(date)}
          </div>
          <div className="text-[12px] text-muted">{formatLongDate(date)}</div>
        </div>
        <button
          onClick={() => setDate(addDays(date, 1))}
          aria-label="Next day"
          className="h-10 w-10 flex items-center justify-center rounded-xl bg-warmwhite border border-beige text-charcoal active:bg-beige/60"
        >
          <IconChevron width={20} height={20} />
        </button>
      </div>

      {!isToday(date) && (
        <div className="px-4 mt-2 text-center">
          <button
            onClick={() => setDate(todayISO())}
            className="chip bg-sage/20 text-[#4c6140]"
          >
            Jump to Today
          </button>
        </div>
      )}

      {/* Next up banner */}
      {nextUp && (
        <div className="px-4 mt-3">
          <div className="rounded-2xl bg-charcoal text-cream px-4 py-3 flex items-center justify-between shadow-card">
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wide text-cream/60 font-bold">
                {nextUp.status === "in_progress" ? "In progress" : "Next up"}
              </div>
              <div className="font-display font-bold truncate">
                {getDog(nextUp.dog_id)?.name} · {nextUp.scheduled_start_time && formatTimeSafe(nextUp.scheduled_start_time)}
              </div>
            </div>
            <div className="text-right text-[12px] text-cream/70 shrink-0 pl-3">
              {remaining} left
            </div>
          </div>
        </div>
      )}

      {/* Search + filters */}
      <div className="px-4 mt-3">
        <div className="relative">
          <IconSearch
            width={18}
            height={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dog or owner"
            className="field !pl-10 !py-2.5"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-2.5 -mx-4 px-4">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`chip whitespace-nowrap border ${
                filter === f.key
                  ? "bg-charcoal text-cream border-charcoal"
                  : "bg-warmwhite text-muted border-beige"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Walk list */}
      <div className="px-4 mt-3 space-y-3">
        {walks.length === 0 ? (
          <EmptyState
            title={query || filter !== "all" ? "No matching walks" : "No walks scheduled"}
            subtitle={
              query || filter !== "all"
                ? "Try clearing your search or filter."
                : "Add a walk for this day to get started."
            }
            action={
              <Link href={`/walks/new?date=${date}`} className="btn btn-primary">
                <IconPlus width={18} height={18} /> Add walk
              </Link>
            }
          />
        ) : (
          walks.map((w) => <WalkCard key={w.id} walk={w} />)
        )}
      </div>

      {walks.length > 0 && (
        <div className="px-4 mt-4">
          <Link
            href={`/walks/new?date=${date}`}
            className="btn btn-ghost w-full border border-dashed border-beige"
          >
            <IconPlus width={18} height={18} /> Add walk
          </Link>
        </div>
      )}
    </div>
  );
}

function formatTimeSafe(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  let hh = h % 12;
  if (hh === 0) hh = 12;
  return `${hh}:${String(m).padStart(2, "0")} ${ampm}`;
}
