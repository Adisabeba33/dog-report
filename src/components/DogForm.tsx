"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Dog } from "@/lib/types";
import { useStore } from "@/lib/store";
import { PageHeader, EmptyState } from "@/components/ui";
import { TextField, TextArea, SelectField, FormActions, SectionCard } from "@/components/form";
import { DogPhotoInput } from "@/components/PhotoInput";
import Link from "next/link";

type Draft = Omit<Dog, "id" | "created_at" | "updated_at">;

export default function DogForm({ existing }: { existing?: Dog }) {
  const router = useRouter();
  const params = useSearchParams();
  const { db, addDog, updateDog, deleteDog } = useStore();
  const presetClient = params.get("client") ?? "";

  const [d, setD] = useState<Draft>(
    existing
      ? { ...existing }
      : {
          client_id: presetClient || db.clients[0]?.id || "",
          name: "",
          breed: "",
          age: "",
          photo_url: "",
          temperament: "",
          leash_behavior: "",
          medical_notes: "",
          allergies: "",
          feeding_instructions: "",
          water_instructions: "",
          favorite_route: "",
          avoid_notes: "",
          private_notes: "",
        },
  );
  const set = (patch: Partial<Draft>) => setD((prev) => ({ ...prev, ...patch }));

  if (db.clients.length === 0) {
    return (
      <div>
        <PageHeader title={existing ? "Edit Dog" : "New Dog"} back />
        <EmptyState
          title="Add a client first"
          subtitle="Every dog belongs to a client. Create the owner, then add their dog."
          action={
            <Link href="/clients/new" className="btn btn-primary">
              Add client
            </Link>
          }
        />
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!d.name.trim() || !d.client_id) return;
    if (existing) {
      updateDog(existing.id, d);
      router.push(`/dogs/detail?id=${existing.id}`);
    } else {
      const dog = addDog(d);
      router.push(`/dogs/detail?id=${dog.id}`);
    }
  };

  return (
    <form onSubmit={submit}>
      <PageHeader title={existing ? "Edit Dog" : "New Dog"} back />
      <div className="px-4 space-y-4">
        <SectionCard title="Basics">
          <DogPhotoInput name={d.name} value={d.photo_url} onChange={(url) => set({ photo_url: url })} />
          <TextField
            label="Dog name"
            required
            placeholder="e.g. Luna"
            value={d.name}
            onChange={(e) => set({ name: e.target.value })}
          />
          <SelectField
            label="Owner / client"
            value={d.client_id}
            onChange={(e) => set({ client_id: e.target.value })}
          >
            {db.clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.owner_name}
              </option>
            ))}
          </SelectField>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Breed" value={d.breed} onChange={(e) => set({ breed: e.target.value })} placeholder="Border Collie" />
            <TextField label="Age" value={d.age} onChange={(e) => set({ age: e.target.value })} placeholder="3 years" />
          </div>
        </SectionCard>

        <SectionCard title="Behavior">
          <TextArea label="Temperament" value={d.temperament} onChange={(e) => set({ temperament: e.target.value })} placeholder="Friendly but reactive to scooters." />
          <TextArea label="Leash behavior" value={d.leash_behavior} onChange={(e) => set({ leash_behavior: e.target.value })} placeholder="Pulls during the first 5 minutes." />
          <TextArea label="Favorite route" value={d.favorite_route} onChange={(e) => set({ favorite_route: e.target.value })} placeholder="Loop through the park." />
          <TextArea label="Things to avoid" value={d.avoid_notes} onChange={(e) => set({ avoid_notes: e.target.value })} placeholder="Large dogs, bikes." />
        </SectionCard>

        <SectionCard title="Care & health">
          <TextArea label="Medical notes" value={d.medical_notes} onChange={(e) => set({ medical_notes: e.target.value })} />
          <TextField label="Allergies" value={d.allergies} onChange={(e) => set({ allergies: e.target.value })} />
          <TextArea label="Feeding instructions" value={d.feeding_instructions} onChange={(e) => set({ feeding_instructions: e.target.value })} />
          <TextArea label="Water instructions" value={d.water_instructions} onChange={(e) => set({ water_instructions: e.target.value })} placeholder="Give water after the walk." />
        </SectionCard>

        <SectionCard title="Private notes">
          <TextArea
            label="Private internal notes"
            privateNote
            hint="Only ever visible to you. Never appears in owner reports."
            value={d.private_notes}
            onChange={(e) => set({ private_notes: e.target.value })}
          />
        </SectionCard>

        {existing && (
          <button
            type="button"
            onClick={() => {
              if (confirm("Delete this dog and all its walks and reports?")) {
                deleteDog(existing.id);
                router.push("/dogs");
              }
            }}
            className="btn btn-danger w-full"
          >
            Delete dog
          </button>
        )}
      </div>

      <FormActions
        onCancel={() => router.back()}
        saveLabel={existing ? "Save changes" : "Add dog"}
        disabled={!d.name.trim() || !d.client_id}
      />
    </form>
  );
}
