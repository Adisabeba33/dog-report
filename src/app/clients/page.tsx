"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { PageHeader, EmptyState, DogAvatar, Fab } from "@/components/ui";
import { IconPlus, IconSearch, IconChevron } from "@/components/icons";

export default function ClientsPage() {
  const { db, dogsForClient } = useStore();
  const [query, setQuery] = useState("");

  const clients = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...db.clients]
      .sort((a, b) => a.owner_name.localeCompare(b.owner_name))
      .filter((c) => !q || c.owner_name.toLowerCase().includes(q));
  }, [db.clients, query]);

  return (
    <div>
      <PageHeader title="Clients" subtitle={`${db.clients.length} owner${db.clients.length === 1 ? "" : "s"}`} />

      <div className="px-4">
        <div className="relative">
          <IconSearch width={18} height={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients"
            className="field !pl-10 !py-2.5"
          />
        </div>
      </div>

      <div className="px-4 mt-3 space-y-2.5">
        {clients.length === 0 ? (
          <EmptyState
            title="No clients yet"
            subtitle="Add your first dog owner to start scheduling walks."
            action={
              <Link href="/clients/new" className="btn btn-primary">
                <IconPlus width={18} height={18} /> Add client
              </Link>
            }
          />
        ) : (
          clients.map((c) => {
            const dogs = dogsForClient(c.id);
            return (
              <Link key={c.id} href={`/clients/detail?id=${c.id}`} className="card p-3.5 flex items-center gap-3 active:bg-cream/40">
                <div className="flex -space-x-3">
                  {dogs.slice(0, 3).map((dog) => (
                    <DogAvatar key={dog.id} name={dog.name} photo={dog.photo_url} size={44} className="ring-2 ring-warmwhite" />
                  ))}
                  {dogs.length === 0 && (
                    <div className="h-11 w-11 rounded-2xl bg-beige/60 flex items-center justify-center text-brown font-display font-bold">
                      {c.owner_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-charcoal truncate">{c.owner_name}</div>
                  <div className="text-[13px] text-muted truncate">
                    {dogs.length ? dogs.map((d) => d.name).join(", ") : "No dogs yet"}
                  </div>
                </div>
                <IconChevron width={18} height={18} className="text-muted" />
              </Link>
            );
          })
        )}
      </div>

      {clients.length > 0 && <Fab href="/clients/new" label="+ Client" />}
    </div>
  );
}
