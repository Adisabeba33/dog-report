"use client";


import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { PageHeader, EmptyState, DogAvatar, StatusBadge } from "@/components/ui";
import { formatShortDate, todayISO, formatWindow } from "@/lib/date";
import {
  IconPhone,
  IconMail,
  IconPin,
  IconLock,
  IconEdit,
  IconPlus,
  IconChevron,
} from "@/components/icons";

function ClientDetailPage() {
  const id = useSearchParams().get("id") ?? "";
  const router = useRouter();
  const { getClient, dogsForClient, db } = useStore();
  const client = getClient(id);

  if (!client) {
    return (
      <div>
        <PageHeader title="Client" back="/clients" />
        <EmptyState title="Client not found" />
      </div>
    );
  }

  const dogs = dogsForClient(client.id);
  const today = todayISO();
  const upcoming = db.walks
    .filter((w) => w.client_id === client.id && w.scheduled_date >= today && w.status !== "canceled")
    .sort((a, b) => (a.scheduled_date + a.scheduled_start_time).localeCompare(b.scheduled_date + b.scheduled_start_time))
    .slice(0, 5);
  const reports = db.reports
    .filter((r) => r.client_id === client.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div>
      <PageHeader
        title={client.owner_name}
        back="/clients"
        right={
          <Link href={`/clients/edit?id=${client.id}`} aria-label="Edit" className="h-9 w-9 flex items-center justify-center rounded-full active:bg-beige/60">
            <IconEdit width={20} height={20} />
          </Link>
        }
      />

      <div className="px-4 space-y-4">
        {/* Contact actions */}
        <div className="flex gap-2">
          {client.phone && (
            <a href={`tel:${client.phone}`} className="btn btn-ghost flex-1">
              <IconPhone width={18} height={18} /> Call
            </a>
          )}
          {client.email && (
            <a href={`mailto:${client.email}`} className="btn btn-ghost flex-1">
              <IconMail width={18} height={18} /> Email
            </a>
          )}
        </div>

        {/* Details */}
        <section className="card p-4 space-y-2.5">
          {(client.address || client.apartment_info) && (
            <Row icon={<IconPin width={16} height={16} />}>
              {client.address}
              {client.apartment_info ? ` · ${client.apartment_info}` : ""}
            </Row>
          )}
          {client.phone && <Row icon={<IconPhone width={16} height={16} />}>{client.phone}</Row>}
          {client.email && <Row icon={<IconMail width={16} height={16} />}>{client.email}</Row>}
          {client.access_instructions && (
            <div className="pt-1 text-[14px] text-charcoal">
              <div className="section-title mb-1">Access</div>
              {client.access_instructions}
            </div>
          )}
          {client.emergency_contact_name && (
            <div className="pt-1 text-[14px]">
              <div className="section-title mb-1">Emergency contact</div>
              {client.emergency_contact_name}
              {client.emergency_contact_phone ? ` · ${client.emergency_contact_phone}` : ""}
            </div>
          )}
          {client.payment_notes && (
            <div className="pt-1 text-[14px]">
              <div className="section-title mb-1">Payment</div>
              {client.payment_notes}
            </div>
          )}
        </section>

        {client.private_notes && (
          <div className="rounded-2xl bg-gold/15 border border-gold/30 p-4">
            <div className="flex items-center gap-1.5 text-[#8a6d1f] font-semibold text-[13px] mb-1">
              <IconLock width={14} height={14} /> Private note
            </div>
            <p className="text-[14px] text-charcoal">{client.private_notes}</p>
          </div>
        )}

        {/* Dogs */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="section-title">Dogs</h2>
            <Link href={`/dogs/new?client=${client.id}`} className="text-sage" aria-label="Add dog">
              <IconPlus width={20} height={20} />
            </Link>
          </div>
          {dogs.length === 0 ? (
            <Link href={`/dogs/new?client=${client.id}`} className="block rounded-xl border border-dashed border-beige text-muted text-[13px] py-3 text-center active:bg-beige/30">
              Add a dog for this client
            </Link>
          ) : (
            <div className="space-y-2">
              {dogs.map((dog) => (
                <Link key={dog.id} href={`/dogs/detail?id=${dog.id}`} className="card p-3 flex items-center gap-3 active:bg-cream/40">
                  <DogAvatar name={dog.name} photo={dog.photo_url} size={44} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-charcoal truncate">{dog.name}</div>
                    <div className="text-[12px] text-muted truncate">{dog.breed || "—"}</div>
                  </div>
                  <IconChevron width={18} height={18} className="text-muted" />
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Upcoming walks */}
        <section>
          <h2 className="section-title mb-2">Upcoming walks</h2>
          {upcoming.length === 0 ? (
            <p className="text-[13px] text-muted">No upcoming walks.</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map((w) => {
                const dog = dogs.find((d) => d.id === w.dog_id);
                return (
                  <Link key={w.id} href={`/walks/edit?id=${w.id}`} className="card p-3 flex items-center gap-3 active:bg-cream/40">
                    <div className="text-center w-16 shrink-0">
                      <div className="text-[12px] font-semibold text-charcoal">{formatShortDate(w.scheduled_date)}</div>
                      <div className="text-[11px] text-muted">{formatWindow(w.window_start, w.window_end)}</div>
                    </div>
                    <div className="flex-1 min-w-0 font-semibold text-charcoal truncate">{dog?.name}</div>
                    <StatusBadge status={w.status} />
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Past reports */}
        <section>
          <h2 className="section-title mb-2">Past reports</h2>
          {reports.length === 0 ? (
            <p className="text-[13px] text-muted">No reports yet.</p>
          ) : (
            <div className="space-y-2">
              {reports.map((r) => {
                const dog = dogs.find((d) => d.id === r.dog_id);
                return (
                  <Link key={r.id} href={`/reports/detail?id=${r.id}`} className="card p-3 flex items-center gap-3 active:bg-cream/40">
                    <DogAvatar name={dog?.name ?? "?"} photo={dog?.photo_url} size={38} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-charcoal truncate">{dog?.name}</div>
                      <div className="text-[12px] text-muted">{formatShortDate(r.date)}</div>
                    </div>
                    {r.sent_at ? (
                      <span className="chip bg-sage/25 text-[#4c6140]">Sent</span>
                    ) : (
                      <span className="chip bg-beige text-brown">Not sent</span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Row({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[14px] text-charcoal">
      <span className="text-brown shrink-0">{icon}</span>
      <span className="min-w-0">{children}</span>
    </div>
  );
}


export default function Page() {
  return (
    <Suspense fallback={null}>
      <ClientDetailPage />
    </Suspense>
  );
}
