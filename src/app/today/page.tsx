"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import {
  todayISO,
  addDays,
  isToday,
  weekdayName,
  parseISODate,
  formatWindow,
  isWindow,
} from "@/lib/date";
import type { Walk, WalkStatus } from "@/lib/types";
import { DogAvatar } from "@/components/ui";
import {
  IconSearch,
  IconFilter,
  IconChevron,
  IconChevronLeft,
  IconPlus,
  IconPlay,
  IconCheck,
  IconPin,
  IconClients,
  IconLock,
  IconX,
  IconClock,
} from "@/components/icons";

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function shortDate(s: string) {
  const d = parseISODate(s);
  return `${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()]}, ${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
}

const FILTERS: { key: WalkStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "scheduled", label: "Scheduled" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "canceled", label: "Canceled" },
];

export default function TodayPage() {
  const { walksForDate, getDog, getClient, startWalk } = useStore();
  const [date, setDate] = useState<string>(todayISO());
  const [filter, setFilter] = useState<WalkStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const allWalks = walksForDate(date);
  const leftCount = allWalks.filter((w) => w.status === "scheduled" || w.status === "in_progress").length;

  // The current/next walk = first in-progress, else earliest scheduled.
  const nextWalk =
    allWalks.find((w) => w.status === "in_progress") ??
    allWalks.find((w) => w.status === "scheduled");

  const timeline = useMemo(() => {
    let list = allWalks;
    if (filter !== "all") list = list.filter((w) => w.status === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((w) => {
        const dog = getDog(w.dog_id);
        const client = getClient(w.client_id);
        return dog?.name.toLowerCase().includes(q) || client?.owner_name.toLowerCase().includes(q);
      });
    }
    return list;
  }, [allWalks, filter, query, getDog, getClient]);

  return (
    <div className="min-h-[100dvh]">
      {/* Compact header */}
      <header className="px-5 pt-4 pb-2 sticky top-0 z-20 bg-cream/90 backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-[32px] leading-none font-extrabold text-charcoal">
              {isToday(date) ? "Today" : weekdayName(date)}
            </h1>
            <div className="mt-1.5 flex items-center gap-1.5 text-[14px] text-muted">
              <button
                onClick={() => setDate(addDays(date, -1))}
                aria-label="Previous day"
                className="h-6 w-6 -ml-1 flex items-center justify-center rounded-full active:bg-beige/60 text-charcoal/70"
              >
                <IconChevronLeft width={16} height={16} />
              </button>
              <span className="tabular-nums">
                {shortDate(date)} · {allWalks.length} walk{allWalks.length === 1 ? "" : "s"}
                {leftCount > 0 && <span className="text-sage font-semibold"> · {leftCount} left</span>}
              </span>
              <button
                onClick={() => setDate(addDays(date, 1))}
                aria-label="Next day"
                className="h-6 w-6 flex items-center justify-center rounded-full active:bg-beige/60 text-charcoal/70"
              >
                <IconChevron width={16} height={16} />
              </button>
              {!isToday(date) && (
                <button
                  onClick={() => setDate(todayISO())}
                  className="ml-1 text-[12px] font-semibold text-sage"
                >
                  Today
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 pt-1">
            <IconButton
              active={showSearch}
              label="Search"
              onClick={() => { setShowSearch((v) => !v); setShowFilter(false); }}
            >
              <IconSearch width={19} height={19} />
            </IconButton>
            <IconButton
              active={showFilter || filter !== "all"}
              label="Filter"
              onClick={() => { setShowFilter((v) => !v); setShowSearch(false); }}
            >
              <IconFilter width={19} height={19} />
            </IconButton>
          </div>
        </div>

        {/* Collapsible search */}
        {showSearch && (
          <div className="mt-3 relative">
            <IconSearch width={17} height={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dog or owner"
              className="field !pl-9 !py-2.5"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
              >
                <IconX width={16} height={16} />
              </button>
            )}
          </div>
        )}

        {/* Collapsible filter */}
        {showFilter && (
          <div className="mt-3 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => { setFilter(f.key); setShowFilter(false); }}
                className={`chip border ${
                  filter === f.key
                    ? "bg-sage text-white border-sage"
                    : "bg-warmwhite text-muted border-beige"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="px-5 pt-1">
        {/* Next walk card */}
        {nextWalk ? (
          <NextWalkCard walk={nextWalk} onStart={() => startWalk(nextWalk.id)} />
        ) : (
          <div
            className="rounded-3xl border p-6 text-center"
            style={{ backgroundColor: "#F1EFE3", borderColor: "#E6DDD0" }}
          >
            <div className="font-display text-[18px] font-bold text-charcoal">
              {allWalks.length ? "All done for today" : "No walks scheduled"}
            </div>
            <p className="text-[14px] text-muted mt-1">
              {allWalks.length ? "Every walk is wrapped up. Nice work." : "Add a walk to plan your day."}
            </p>
          </div>
        )}

        {/* Today's Route timeline */}
        {timeline.length > 0 && (
          <>
            <h2 className="font-display text-[18px] font-extrabold text-charcoal mt-6 mb-3">
              Today&rsquo;s Route
            </h2>
            <div>
              {timeline.map((w, i) => (
                <TimelineRow
                  key={w.id}
                  walk={w}
                  first={i === 0}
                  last={i === timeline.length - 1}
                  isNext={w.id === nextWalk?.id}
                />
              ))}
            </div>
          </>
        )}

        {timeline.length === 0 && (query || filter !== "all") && (
          <p className="text-center text-[14px] text-muted mt-8">No matching walks.</p>
        )}

        {/* Add walk */}
        <Link
          href={`/walks/new?date=${date}`}
          className="mt-5 mb-2 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-[16px] font-semibold text-[#5c7249] active:opacity-80"
          style={{ backgroundColor: "#EAF0E2", border: "1px solid #DCE6D0" }}
        >
          <IconPlus width={18} height={18} /> Add Walk
        </Link>
      </div>
    </div>
  );
}

function IconButton({
  children,
  onClick,
  label,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`h-10 w-10 flex items-center justify-center rounded-full border transition-colors ${
        active ? "bg-sage/20 border-sage/40 text-[#5c7249]" : "bg-warmwhite border-beige text-charcoal"
      }`}
    >
      {children}
    </button>
  );
}

function NextWalkCard({ walk, onStart }: { walk: Walk; onStart: () => void }) {
  const router = useRouter();
  const { getDog, getClient } = useStore();
  const dog = getDog(walk.dog_id);
  const client = getClient(walk.client_id);
  const address = walk.address_override || client?.address || "";
  const inProgress = walk.status === "in_progress";

  return (
    <div
      className="rounded-3xl border p-4 shadow-soft"
      style={{ backgroundColor: "#F1EFE3", borderColor: "#E1DAC9" }}
    >
      <div className="flex items-center gap-2">
        {inProgress && <span className="h-1.5 w-1.5 rounded-full bg-sage animate-pulse" />}
        <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#7c8a6b]">
          {inProgress ? "In Progress" : "Next Walk"}
        </span>
      </div>

      <div className="mt-2 flex gap-4">
        <button onClick={() => dog && router.push(`/dogs/detail?id=${dog.id}`)} className="shrink-0 self-start">
          <DogAvatar name={dog?.name ?? "?"} photo={dog?.photo_url} size={76} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-[28px] leading-none font-extrabold text-charcoal truncate">
              {dog?.name ?? "Unknown"}
            </h3>
            <span
              className="chip shrink-0 text-[12px] !py-1"
              style={{ backgroundColor: "#E4E9DA", color: "#5c7249" }}
            >
              {walk.duration_minutes} min
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[15px] font-semibold text-[#5c7249]">
            <IconClock width={15} height={15} className="shrink-0" />
            <span className="truncate">
              {formatWindow(walk.window_start, walk.window_end)}
              {isWindow(walk.window_start, walk.window_end) && (
                <span className="text-muted font-normal text-[13px]"> window</span>
              )}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[15px] text-charcoal">
            <IconClients width={15} height={15} className="text-muted shrink-0" />
            <span className="truncate">{client?.owner_name ?? ""}</span>
          </div>
          {address && (
            <div className="mt-1 flex items-center gap-1.5 text-[14px] text-brown/90">
              <IconPin width={15} height={15} className="text-muted shrink-0" />
              <span className="truncate">{address}</span>
            </div>
          )}
        </div>
      </div>

      {walk.private_notes && (
        <div
          className="mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5 text-[14px] text-[#8a6d1f]"
          style={{ backgroundColor: "#F7EED8" }}
        >
          <IconLock width={14} height={14} className="mt-0.5 shrink-0" />
          <span>{walk.private_notes}</span>
        </div>
      )}

      <div className="mt-4 flex gap-3">
        {!inProgress && (
          <button
            onClick={onStart}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-[16px] font-semibold text-white active:opacity-90"
            style={{ backgroundColor: "#8FA77D" }}
          >
            <IconPlay width={18} height={18} /> Start Walk
          </button>
        )}
        <button
          onClick={() => router.push(`/walks/complete?id=${walk.id}`)}
          className={`flex-1 inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-[16px] font-semibold active:opacity-90 ${
            inProgress ? "text-white" : "text-charcoal"
          }`}
          style={
            inProgress
              ? { backgroundColor: "#8FA77D" }
              : { backgroundColor: "#FFFDF8", border: "1px solid #E1DAC9" }
          }
        >
          <IconCheck width={18} height={18} /> Complete
        </button>
      </div>
    </div>
  );
}

function TimelineRow({
  walk,
  first,
  last,
  isNext,
}: {
  walk: Walk;
  first: boolean;
  last: boolean;
  isNext: boolean;
}) {
  const router = useRouter();
  const { getDog, getClient, reportForWalk } = useStore();
  const dog = getDog(walk.dog_id);
  const client = getClient(walk.client_id);
  const report = walk.status === "completed" ? reportForWalk(walk.id) : undefined;
  const completed = walk.status === "completed";
  const muted = walk.status === "canceled" || walk.status === "skipped";
  const scheduled = walk.status === "scheduled" && !isNext;

  const [h, m] = walk.window_start.split(":");
  const hour12 = ((Number(h) + 11) % 12) + 1;
  const ampm = Number(h) >= 12 ? "PM" : "AM";

  const lineColor = completed ? "#8FA77D" : "#E6DDD0";

  const openRow = () => {
    if (completed) router.push(report ? `/reports/detail?id=${report.id}` : `/walks/complete?id=${walk.id}`);
    else router.push(`/walks/edit?id=${walk.id}`);
  };

  return (
    <div className="flex gap-2.5">
      {/* time */}
      <div className="w-[52px] text-right pt-2 shrink-0">
        <div className={`text-[14px] font-bold leading-none ${muted ? "text-muted" : "text-charcoal"}`}>
          {hour12}:{m}
        </div>
        <div className="text-[11px] text-muted mt-0.5">{ampm}</div>
      </div>

      {/* dot + connecting line */}
      <div className="relative w-4 shrink-0 self-stretch">
        {!first && (
          <span
            className="absolute left-1/2 -translate-x-1/2 top-0 h-[14px] w-[2px]"
            style={{ backgroundColor: completed ? "#8FA77D" : "#E6DDD0" }}
          />
        )}
        {!last && (
          <span
            className="absolute left-1/2 -translate-x-1/2 top-[14px] bottom-0 w-[2px]"
            style={{ backgroundColor: lineColor }}
          />
        )}
        <span className="absolute left-1/2 -translate-x-1/2 top-[7px]">
          {completed ? (
            <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full" style={{ backgroundColor: "#8FA77D" }}>
              <IconCheck width={12} height={12} className="text-white" />
            </span>
          ) : isNext ? (
            <span className="block h-[14px] w-[14px] rounded-full ring-4 ring-[#E8EFE2]" style={{ backgroundColor: "#8FA77D" }} />
          ) : muted ? (
            <span className="block h-[14px] w-[14px] rounded-full bg-neutral-300 border-2 border-cream" />
          ) : (
            <span className="block h-[14px] w-[14px] rounded-full bg-warmwhite" style={{ border: "2px solid #CFC6B6" }} />
          )}
        </span>
      </div>

      {/* card */}
      <button
        onClick={openRow}
        className="flex-1 min-w-0 text-left mb-3 rounded-2xl p-3 flex items-center gap-3 active:opacity-90"
        style={
          isNext
            ? { backgroundColor: "#E8EFE2", border: "1px solid #D3E0C6" }
            : { backgroundColor: "#FFFDF8", border: "1px solid #EBE3D5", opacity: muted ? 0.7 : 1 }
        }
      >
        <DogAvatar name={dog?.name ?? "?"} photo={dog?.photo_url} size={44} />
        <div className="flex-1 min-w-0">
          <div className={`font-display font-bold text-[17px] leading-tight truncate ${muted ? "text-muted line-through" : "text-charcoal"}`}>
            {dog?.name ?? "Unknown"}
          </div>
          <div className="text-[13px] text-muted truncate">{client?.owner_name ?? ""}</div>
          {isWindow(walk.window_start, walk.window_end) && (
            <div className="text-[12px] text-muted truncate mt-0.5">
              {formatWindow(walk.window_start, walk.window_end)}
            </div>
          )}
          <div className="mt-1.5 flex items-center gap-2">
            <StatusPill status={walk.status} isNext={isNext} />
            {completed && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(report ? `/reports/detail?id=${report.id}` : `/walks/complete?id=${walk.id}`);
                }}
                className="text-[12px] font-semibold text-[#5c7249]"
              >
                View report
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 self-start pt-0.5">
          <span className="text-[13px] text-muted whitespace-nowrap">{walk.duration_minutes} min</span>
          {scheduled && <IconChevron width={16} height={16} className="text-muted" />}
        </div>
      </button>
    </div>
  );
}

function StatusPill({ status, isNext }: { status: WalkStatus; isNext: boolean }) {
  if (isNext && status !== "completed") {
    return <span className="chip !py-0.5 !px-2.5 text-[12px]" style={{ backgroundColor: "#D3E0C6", color: "#4c6140" }}>Next</span>;
  }
  const map: Record<WalkStatus, { label: string; bg: string; fg: string }> = {
    scheduled: { label: "Scheduled", bg: "#EFE7D8", fg: "#8b7a5e" },
    in_progress: { label: "In Progress", bg: "#F0E4C4", fg: "#8a6d1f" },
    completed: { label: "Completed", bg: "#E4EDDB", fg: "#4c6140" },
    canceled: { label: "Canceled", bg: "#F3DEDE", fg: "#a15252" },
    skipped: { label: "Skipped", bg: "#E7E3DC", fg: "#8A8176" },
  };
  const s = map[status];
  return <span className="chip !py-0.5 !px-2.5 text-[12px]" style={{ backgroundColor: s.bg, color: s.fg }}>{s.label}</span>;
}
