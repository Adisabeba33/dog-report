"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Client } from "@/lib/types";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/ui";
import { TextField, TextArea, SelectField, FormActions, SectionCard } from "@/components/form";

type Draft = Omit<Client, "id" | "created_at" | "updated_at">;

const EMPTY: Draft = {
  owner_name: "",
  phone: "",
  email: "",
  address: "",
  apartment_info: "",
  access_instructions: "",
  preferred_report_method: "share",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  payment_notes: "",
  private_notes: "",
};

export default function ClientForm({ existing }: { existing?: Client }) {
  const router = useRouter();
  const { addClient, updateClient, deleteClient } = useStore();
  const [d, setD] = useState<Draft>(existing ? { ...existing } : EMPTY);
  const set = (patch: Partial<Draft>) => setD((prev) => ({ ...prev, ...patch }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!d.owner_name.trim()) return;
    if (existing) {
      updateClient(existing.id, d);
      router.push(`/clients/${existing.id}`);
    } else {
      const c = addClient(d);
      router.push(`/clients/${c.id}`);
    }
  };

  return (
    <form onSubmit={submit}>
      <PageHeader title={existing ? "Edit Client" : "New Client"} back />
      <div className="px-4 space-y-4">
        <SectionCard title="Contact">
          <TextField
            label="Owner name"
            required
            placeholder="e.g. Sarah Bennett"
            value={d.owner_name}
            onChange={(e) => set({ owner_name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Phone"
              type="tel"
              inputMode="tel"
              placeholder="(555) 000-0000"
              value={d.phone}
              onChange={(e) => set({ phone: e.target.value })}
            />
            <SelectField
              label="Report method"
              value={d.preferred_report_method}
              onChange={(e) => set({ preferred_report_method: e.target.value as Draft["preferred_report_method"] })}
            >
              <option value="share">Share sheet</option>
              <option value="email">Email</option>
              <option value="text">Text</option>
              <option value="">Not set</option>
            </SelectField>
          </div>
          <TextField
            label="Email"
            type="email"
            inputMode="email"
            placeholder="name@example.com"
            value={d.email}
            onChange={(e) => set({ email: e.target.value })}
          />
        </SectionCard>

        <SectionCard title="Home & access">
          <TextField
            label="Address"
            placeholder="123 Bedford Ave"
            value={d.address}
            onChange={(e) => set({ address: e.target.value })}
          />
          <TextField
            label="Apartment / unit"
            placeholder="Apt 4R"
            value={d.apartment_info}
            onChange={(e) => set({ apartment_info: e.target.value })}
          />
          <TextArea
            label="Access instructions"
            placeholder="Lockbox code, which entrance, gate, etc."
            value={d.access_instructions}
            onChange={(e) => set({ access_instructions: e.target.value })}
          />
        </SectionCard>

        <SectionCard title="Emergency & payment">
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Emergency name"
              value={d.emergency_contact_name}
              onChange={(e) => set({ emergency_contact_name: e.target.value })}
            />
            <TextField
              label="Emergency phone"
              type="tel"
              value={d.emergency_contact_phone}
              onChange={(e) => set({ emergency_contact_phone: e.target.value })}
            />
          </div>
          <TextArea
            label="Payment notes"
            placeholder="How and when this client pays"
            value={d.payment_notes}
            onChange={(e) => set({ payment_notes: e.target.value })}
          />
        </SectionCard>

        <SectionCard title="Private notes">
          <TextArea
            label="Private notes"
            privateNote
            hint="Only ever visible to you. Never appears in owner reports."
            placeholder="Anything you want to remember about this client"
            value={d.private_notes}
            onChange={(e) => set({ private_notes: e.target.value })}
          />
        </SectionCard>

        {existing && (
          <button
            type="button"
            onClick={() => {
              if (confirm("Delete this client and all their dogs, walks, and reports?")) {
                deleteClient(existing.id);
                router.push("/clients");
              }
            }}
            className="btn btn-danger w-full"
          >
            Delete client
          </button>
        )}
      </div>

      <FormActions
        onCancel={() => router.back()}
        saveLabel={existing ? "Save changes" : "Add client"}
        disabled={!d.owner_name.trim()}
      />
    </form>
  );
}
