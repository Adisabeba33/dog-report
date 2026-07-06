"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { PageHeader, EmptyState, DogAvatar, Fab } from "@/components/ui";
import { IconPlus, IconSearch, IconChevron } from "@/components/icons";

export default function DogsPage() {
  const { db, getClient } = useStore();
  const [query, setQuery] = useState("");

  const dogs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...db.dogs]
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter((d) => !q || d.name.toLowerCase().includes(q) || d.breed.toLowerCase().includes(q));
  }, [db.dogs, query]);

  return (
    <div>
      <PageHeader title="Dogs" subtitle={`${db.dogs.length} dog${db.dogs.length === 1 ? "" : "s"}`} />

      <div className="px-4">
        <div className="relative">
          <IconSearch width={18} height={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dogs"
            className="field !pl-10 !py-2.5"
          />
        </div>
      </div>

      <div className="px-4 mt-3">
        {dogs.length === 0 ? (
          <EmptyState
            title="No dogs yet"
            subtitle="Add a dog under one of your clients."
            action={
              <Link href="/dogs/new" className="btn btn-primary">
                <IconPlus width={18} height={18} /> Add dog
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {dogs.map((dog) => {
              const client = getClient(dog.client_id);
              return (
                <Link key={dog.id} href={`/dogs/${dog.id}`} className="card p-3 flex flex-col items-center text-center active:bg-cream/40">
                  <DogAvatar name={dog.name} photo={dog.photo_url} size={72} />
                  <div className="font-display font-bold text-charcoal mt-2 truncate w-full">{dog.name}</div>
                  <div className="text-[12px] text-muted truncate w-full">{dog.breed || "—"}</div>
                  <div className="text-[12px] text-brown/80 truncate w-full mt-0.5">{client?.owner_name}</div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {dogs.length > 0 && <Fab href="/dogs/new" label="+ Dog" />}
    </div>
  );
}
