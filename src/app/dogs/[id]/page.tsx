"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { PageHeader, EmptyState, DogAvatar, StatusBadge } from "@/components/ui";
import { formatShortDate, formatTime, todayISO } from "@/lib/date";
import { IconEdit, IconLock, IconPlus, IconChevron } from "@/components/icons";

export default function DogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getDog, getClient, db } = useStore();
  const dog = getDog(id);

  if (!dog) {
    return (
      <div>
        <PageHeader title="Dog" back="/dogs" />
        <EmptyState title="Dog not found" />
      </div>
    );
  }

  const client = getClient(dog.client_id);
  const today = todayISO();
  const upcoming = db.walks
    .filter((w) => w.dog_id === dog.id && w.scheduled_date >= today && w.status !== "canceled")
    .sort((a, b) => (a.scheduled_date + a.scheduled_start_time).localeCompare(b.scheduled_date + b.scheduled_start_time))
    .slice(0, 5);
  const reports = db.reports
    .filter((r) => r.dog_id === dog.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  const careItems: [string, string][] = [
    ["Temperament", dog.temperament],
    ["Leash behavior", dog.leash_behavior],
    ["Favorite route", dog.favorite_route],
    ["Avoid", dog.avoid_notes],
    ["Medical", dog.medical_notes],
    ["Allergies", dog.allergies],
    ["Feeding", dog.feeding_instructions],
    ["Water", dog.water_instructions],
  ];

  return (
    <div>
      <PageHeader
        title={dog.name}
        back="/dogs"
        right={
          <Link href={`/dogs/${dog.id}/edit`} aria-label="Edit" className="h-9 w-9 flex items-center justify-center rounded-full active:bg-beige/60">
            <IconEdit width={20} height={20} />
          </Link>
        }
      />

      <div className="px-4 space-y-4">
        {/* Hero */}
        <div className="card p-4 flex items-center gap-4">
          <DogAvatar name={dog.name} photo={dog.photo_url} size={88} />
          <div className="min-w-0">
            <div className="font-display text-xl font-extrabold text-charcoal">{dog.name}</div>
            <div className="text-[14px] text-muted">
              {[dog.breed, dog.age].filter(Boolean).join(" · ") || "—"}
            </div>
            {client && (
              <Link href={`/clients/${client.id}`} className="text-[13px] text-sage font-semibold mt-1 inline-block">
                {client.owner_name}
              </Link>
            )}
          </div>
        </div>

        <Link href={`/walks/new?dog=${dog.id}`} className="btn btn-primary w-full">
          <IconPlus width={18} height={18} /> Schedule a walk
        </Link>

        {/* Care card */}
        {careItems.some(([, v]) => v) && (
          <section className="card p-4 space-y-3">
            <h2 className="section-title">Care notes</h2>
            {careItems
              .filter(([, v]) => v)
              .map(([label, v]) => (
                <div key={label}>
                  <div className="text-[12px] font-semibold text-brown">{label}</div>
                  <div className="text-[14px] text-charcoal">{v}</div>
                </div>
              ))}
          </section>
        )}

        {dog.private_notes && (
          <div className="rounded-2xl bg-gold/15 border border-gold/30 p-4">
            <div className="flex items-center gap-1.5 text-[#8a6d1f] font-semibold text-[13px] mb-1">
              <IconLock width={14} height={14} /> Private note
            </div>
            <p className="text-[14px] text-charcoal">{dog.private_notes}</p>
          </div>
        )}

        {/* Upcoming */}
        <section>
          <h2 className="section-title mb-2">Upcoming walks</h2>
          {upcoming.length === 0 ? (
            <p className="text-[13px] text-muted">No upcoming walks.</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map((w) => (
                <Link key={w.id} href={`/walks/${w.id}/edit`} className="card p-3 flex items-center gap-3 active:bg-cream/40">
                  <div className="text-center w-16 shrink-0">
                    <div className="text-[12px] font-semibold text-charcoal">{formatShortDate(w.scheduled_date)}</div>
                    <div className="text-[11px] text-muted">{formatTime(w.scheduled_start_time)}</div>
                  </div>
                  <div className="flex-1 text-[13px] text-muted">{w.duration_minutes} min</div>
                  <StatusBadge status={w.status} />
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Reports */}
        <section>
          <h2 className="section-title mb-2">Past reports</h2>
          {reports.length === 0 ? (
            <p className="text-[13px] text-muted">No reports yet.</p>
          ) : (
            <div className="space-y-2">
              {reports.map((r) => (
                <Link key={r.id} href={`/reports/${r.id}`} className="card p-3 flex items-center gap-3 active:bg-cream/40">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-charcoal">{formatShortDate(r.date)}</div>
                    <div className="text-[12px] text-muted truncate">
                      {[r.mood, r.energy && `${r.energy} energy`].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  {r.sent_at ? (
                    <span className="chip bg-sage/25 text-[#4c6140]">Sent</span>
                  ) : (
                    <span className="chip bg-beige text-brown">Not sent</span>
                  )}
                  <IconChevron width={16} height={16} className="text-muted" />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
