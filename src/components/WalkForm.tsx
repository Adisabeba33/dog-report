"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Walk, RepeatRule, WalkStatus } from "@/lib/types";
import { useStore } from "@/lib/store";
import { PageHeader, EmptyState } from "@/components/ui";
import { TextField, TextArea, SelectField, FormActions, SectionCard, Field } from "@/components/form";
import { addMinutesToTime } from "@/lib/date";
import { todayISO } from "@/lib/date";

const DURATIONS = [15, 20, 30, 45, 60, 90];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function WalkForm({ existing }: { existing?: Walk }) {
  const router = useRouter();
  const params = useSearchParams();
  const { db, addWalk, updateWalk, deleteWalk, duplicateWalk, cancelWalk, getDog } = useStore();

  const presetDog = params.get("dog") ?? "";
  const presetDate = params.get("date") ?? todayISO();

  const [dogId, setDogId] = useState(existing?.dog_id ?? presetDog ?? db.dogs[0]?.id ?? "");
  const [date, setDate] = useState(existing?.scheduled_date ?? presetDate);
  const [start, setStart] = useState(existing?.scheduled_start_time ?? "09:00");
  const [duration, setDuration] = useState(existing?.duration_minutes ?? db.settings.default_duration_minutes);
  const [repeat, setRepeat] = useState<RepeatRule>(existing?.repeat_rule ?? "none");
  const [repeatDays, setRepeatDays] = useState<number[]>(existing?.repeat_days ?? []);
  const [addressOverride, setAddressOverride] = useState(existing?.address_override ?? "");
  const [privateNotes, setPrivateNotes] = useState(existing?.private_notes ?? "");
  const [status, setStatus] = useState<WalkStatus>(existing?.status ?? "scheduled");

  const dog = getDog(dogId);
  const client = db.clients.find((c) => c.id === dog?.client_id);
  const end = useMemo(() => addMinutesToTime(start, duration), [start, duration]);

  if (db.dogs.length === 0) {
    return (
      <div>
        <PageHeader title={existing ? "Edit Walk" : "New Walk"} back />
        <EmptyState
          title="Add a dog first"
          subtitle="You need at least one dog before scheduling a walk."
          action={
            <Link href="/dogs/new" className="btn btn-primary">
              Add a dog
            </Link>
          }
        />
      </div>
    );
  }

  const toggleDay = (i: number) =>
    setRepeatDays((prev) => (prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i].sort()));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dogId || !date) return;
    const data: Partial<Walk> = {
      dog_id: dogId,
      client_id: dog?.client_id ?? "",
      scheduled_date: date,
      scheduled_start_time: start,
      scheduled_end_time: end,
      duration_minutes: duration,
      repeat_rule: repeat,
      repeat_days: repeat === "custom" ? repeatDays : [],
      address_override: addressOverride,
      private_notes: privateNotes,
      status,
    };
    if (existing) {
      updateWalk(existing.id, data);
    } else {
      addWalk(data);
    }
    router.push("/today");
  };

  return (
    <form onSubmit={submit}>
      <PageHeader title={existing ? "Edit Walk" : "New Walk"} back />
      <div className="px-4 space-y-4">
        <SectionCard title="Walk">
          <SelectField label="Dog" value={dogId} onChange={(e) => setDogId(e.target.value)}>
            {db.dogs.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </SelectField>

          {client && (
            <div className="rounded-xl bg-cream/70 px-3.5 py-2.5 text-[13px] text-brown">
              <span className="font-semibold">{client.owner_name}</span>
              {client.address && <span className="text-muted"> · {client.address}</span>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <TextField label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <TextField label="Start time" type="time" value={start} onChange={(e) => setStart(e.target.value)} required />
          </div>

          <Field label="Duration">
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDuration(m)}
                  className={`chip border ${
                    duration === m ? "bg-charcoal text-cream border-charcoal" : "bg-warmwhite text-muted border-beige"
                  }`}
                >
                  {m} min
                </button>
              ))}
            </div>
            <div className="text-[12px] text-muted mt-2">
              Ends around {formatEnd(end)}
            </div>
          </Field>
        </SectionCard>

        <SectionCard title="Repeat">
          <SelectField label="Repeat" value={repeat} onChange={(e) => setRepeat(e.target.value as RepeatRule)}>
            <option value="none">Does not repeat</option>
            <option value="weekly">Every week on this day</option>
            <option value="custom">Custom weekly days</option>
          </SelectField>
          {repeat === "custom" && (
            <Field label="Repeat on">
              <div className="flex gap-1.5">
                {DAYS.map((d, i) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className={`flex-1 rounded-lg py-2 text-[12px] font-semibold border ${
                      repeatDays.includes(i) ? "bg-sage text-charcoal border-sage" : "bg-warmwhite text-muted border-beige"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </Field>
          )}
          {repeat !== "none" && !existing && (
            <p className="text-[12px] text-muted">Creates walks for the next 8 weeks.</p>
          )}
        </SectionCard>

        <SectionCard title="Details">
          <TextField
            label="Address override"
            placeholder={client?.address || "Uses client address by default"}
            value={addressOverride}
            onChange={(e) => setAddressOverride(e.target.value)}
          />
          <TextArea
            label="Private note"
            privateNote
            hint="Reminders for you. Never shown to the owner."
            placeholder="Use back entrance. Avoid large dogs."
            value={privateNotes}
            onChange={(e) => setPrivateNotes(e.target.value)}
          />
          {existing && (
            <SelectField label="Status" value={status} onChange={(e) => setStatus(e.target.value as WalkStatus)}>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="canceled">Canceled</option>
              <option value="skipped">Skipped</option>
            </SelectField>
          )}
        </SectionCard>

        {existing && (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                duplicateWalk(existing.id);
                router.push(`/today`);
              }}
              className="btn btn-ghost"
            >
              Duplicate
            </button>
            <button
              type="button"
              onClick={() => {
                const note = prompt("Cancellation note (optional):") ?? "";
                cancelWalk(existing.id, note);
                router.push("/today");
              }}
              className="btn btn-ghost text-red-600"
            >
              Cancel walk
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm("Delete this walk permanently?")) {
                  deleteWalk(existing.id);
                  router.push("/today");
                }
              }}
              className="btn btn-danger col-span-2"
            >
              Delete walk
            </button>
          </div>
        )}
      </div>

      <FormActions
        onCancel={() => router.back()}
        saveLabel={existing ? "Save changes" : "Add walk"}
        disabled={!dogId || !date}
      />
    </form>
  );
}

function formatEnd(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  let hh = h % 12;
  if (hh === 0) hh = 12;
  return `${hh}:${String(m).padStart(2, "0")} ${ampm}`;
}
