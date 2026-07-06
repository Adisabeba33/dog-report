"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { PageHeader, EmptyState, DogAvatar } from "@/components/ui";
import { formatLongDate } from "@/lib/date";
import { IconSearch, IconChevron } from "@/components/icons";

type SentFilter = "all" | "sent" | "unsent";

export default function ReportsPage() {
  const { db, getDog, getClient } = useStore();
  const [query, setQuery] = useState("");
  const [sent, setSent] = useState<SentFilter>("all");
  const [dogFilter, setDogFilter] = useState<string>("all");

  const reports = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...db.reports]
      .sort((a, b) => (b.date + b.created_at).localeCompare(a.date + a.created_at))
      .filter((r) => {
        if (sent === "sent" && !r.sent_at) return false;
        if (sent === "unsent" && r.sent_at) return false;
        if (dogFilter !== "all" && r.dog_id !== dogFilter) return false;
        if (q) {
          const dog = getDog(r.dog_id);
          const client = getClient(r.client_id);
          return (
            dog?.name.toLowerCase().includes(q) ||
            client?.owner_name.toLowerCase().includes(q)
          );
        }
        return true;
      });
  }, [db.reports, query, sent, dogFilter, getDog, getClient]);

  return (
    <div>
      <PageHeader title="Reports" subtitle={`${db.reports.length} total`} />

      <div className="px-4 space-y-2.5">
        <div className="relative">
          <IconSearch width={18} height={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reports"
            className="field !pl-10 !py-2.5"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
          {(["all", "unsent", "sent"] as SentFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setSent(s)}
              className={`chip whitespace-nowrap border capitalize ${
                sent === s ? "bg-charcoal text-cream border-charcoal" : "bg-warmwhite text-muted border-beige"
              }`}
            >
              {s === "all" ? "All" : s === "sent" ? "Sent" : "Not sent"}
            </button>
          ))}
          <select
            value={dogFilter}
            onChange={(e) => setDogFilter(e.target.value)}
            className="chip whitespace-nowrap border bg-warmwhite text-charcoal border-beige"
          >
            <option value="all">All dogs</option>
            {db.dogs.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="px-4 mt-3 space-y-2.5">
        {reports.length === 0 ? (
          <EmptyState
            title="No reports yet"
            subtitle="Complete a walk to create your first owner report."
            action={
              <Link href="/today" className="btn btn-primary">
                Go to Today
              </Link>
            }
          />
        ) : (
          reports.map((r) => {
            const dog = getDog(r.dog_id);
            const client = getClient(r.client_id);
            return (
              <Link key={r.id} href={`/reports/detail?id=${r.id}`} className="card p-3.5 flex items-center gap-3 active:bg-cream/40">
                <DogAvatar name={dog?.name ?? "?"} photo={r.photos[0] || dog?.photo_url} size={48} />
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-charcoal truncate">
                    {dog?.name} <span className="font-normal text-muted text-[13px]">· {client?.owner_name}</span>
                  </div>
                  <div className="text-[12px] text-muted">
                    {formatLongDate(r.date)} · {r.actual_duration_minutes} min
                    {r.mood ? ` · ${r.mood}` : ""}
                  </div>
                </div>
                {r.sent_at ? (
                  <span className="chip bg-sage/25 text-[#4c6140]">Sent</span>
                ) : (
                  <span className="chip bg-beige text-brown">New</span>
                )}
                <IconChevron width={16} height={16} className="text-muted" />
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
