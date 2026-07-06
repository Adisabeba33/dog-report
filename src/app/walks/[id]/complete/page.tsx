"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import type { Mood, Energy } from "@/lib/types";
import { PageHeader, EmptyState, DogAvatar } from "@/components/ui";
import { TextField, TextArea, Field, SectionCard, FormActions } from "@/components/form";
import { MultiPhotoInput } from "@/components/PhotoInput";
import { minutesBetween, nowTime, formatTime } from "@/lib/date";
import { IconCheck } from "@/components/icons";

const MOODS: Mood[] = ["Happy", "Calm", "Excited", "Nervous", "Tired", "Playful", "Relaxed"];
const ENERGIES: Energy[] = ["Low", "Medium", "High"];

export default function CompleteWalkPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getWalk, getDog, db, addReport, updateReport, reportForWalk } = useStore();

  const walk = getWalk(id);
  const existingReport = walk ? reportForWalk(walk.id) : undefined;
  const dog = getDog(walk?.dog_id ?? "");

  const [startT, setStartT] = useState(existingReport?.actual_start_time || walk?.scheduled_start_time || "09:00");
  const [endT, setEndT] = useState(
    existingReport?.actual_end_time || walk?.scheduled_end_time || nowTime(),
  );
  const [mood, setMood] = useState<Mood | "">(existingReport?.mood ?? "Happy");
  const [energy, setEnergy] = useState<Energy | "">(existingReport?.energy ?? "Medium");
  const [pee, setPee] = useState(existingReport?.pee ?? true);
  const [poop, setPoop] = useState(existingReport?.poop ?? true);
  const [water, setWater] = useState(existingReport?.water ?? true);
  const [food, setFood] = useState(existingReport?.food ?? false);
  const [photos, setPhotos] = useState<string[]>(existingReport?.photos ?? []);
  const [publicNote, setPublicNote] = useState(existingReport?.public_note ?? "");
  const [privateNote, setPrivateNote] = useState(existingReport?.private_note ?? walk?.private_notes ?? "");

  const duration = useMemo(() => minutesBetween(startT, endT), [startT, endT]);

  if (!walk) {
    return (
      <div>
        <PageHeader title="Complete Walk" back />
        <EmptyState title="Walk not found" />
      </div>
    );
  }

  const applyTemplate = (text: string) => {
    setPublicNote((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      walk_id: walk.id,
      client_id: walk.client_id,
      dog_id: walk.dog_id,
      date: walk.scheduled_date,
      actual_start_time: startT,
      actual_end_time: endT,
      actual_duration_minutes: duration,
      mood,
      energy,
      pee,
      poop,
      water,
      food,
      public_note: publicNote,
      private_note: privateNote,
      photos,
    };
    if (existingReport) {
      updateReport(existingReport.id, data);
      router.push(`/reports/${existingReport.id}`);
    } else {
      const r = addReport(data);
      router.push(`/reports/${r.id}`);
    }
  };

  return (
    <form onSubmit={submit}>
      <PageHeader title="Quick Report" subtitle={dog?.name} back />

      <div className="px-4 space-y-4">
        {/* Dog banner */}
        <div className="card p-3 flex items-center gap-3">
          <DogAvatar name={dog?.name ?? "?"} photo={dog?.photo_url} size={48} />
          <div>
            <div className="font-display font-bold text-charcoal">{dog?.name}</div>
            <div className="text-[13px] text-muted">Scheduled {formatTime(walk.scheduled_start_time)}</div>
          </div>
        </div>

        {/* Times */}
        <SectionCard title="Time">
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Started" type="time" value={startT} onChange={(e) => setStartT(e.target.value)} />
            <TextField label="Ended" type="time" value={endT} onChange={(e) => setEndT(e.target.value)} />
          </div>
          <div className="text-[13px] text-brown font-semibold">{duration} minute walk</div>
        </SectionCard>

        {/* Mood */}
        <SectionCard title="How was it?">
          <Field label="Mood">
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <Chip key={m} active={mood === m} onClick={() => setMood(mood === m ? "" : m)}>
                  {m}
                </Chip>
              ))}
            </div>
          </Field>
          <Field label="Energy">
            <div className="flex gap-2">
              {ENERGIES.map((en) => (
                <button
                  key={en}
                  type="button"
                  onClick={() => setEnergy(energy === en ? "" : en)}
                  className={`flex-1 rounded-xl py-3 text-[15px] font-semibold border ${
                    energy === en ? "bg-sage text-charcoal border-sage" : "bg-warmwhite text-muted border-beige"
                  }`}
                >
                  {en}
                </button>
              ))}
            </div>
          </Field>
        </SectionCard>

        {/* Booleans */}
        <SectionCard title="Basics">
          <div className="grid grid-cols-2 gap-3">
            <YesNo label="Pee" value={pee} onChange={setPee} />
            <YesNo label="Poop" value={poop} onChange={setPoop} />
            <YesNo label="Water" value={water} onChange={setWater} />
            <YesNo label="Food" value={food} onChange={setFood} />
          </div>
        </SectionCard>

        {/* Note + templates */}
        <SectionCard title="Note to owner">
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
            {db.templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => applyTemplate(t.text)}
                className="chip whitespace-nowrap bg-cream border border-beige text-brown active:bg-beige"
              >
                + {t.title}
              </button>
            ))}
          </div>
          <TextArea
            label="Public note"
            hint="This is what the owner sees. Tap a template above to fill it fast."
            placeholder="Write a friendly update…"
            value={publicNote}
            onChange={(e) => setPublicNote(e.target.value)}
          />
        </SectionCard>

        {/* Photos */}
        <SectionCard title="Photos">
          <MultiPhotoInput values={photos} onChange={setPhotos} max={4} />
        </SectionCard>

        {/* Private */}
        <SectionCard title="Private note">
          <TextArea
            label="Private note"
            privateNote
            hint="Only visible to you. Never appears in the report."
            value={privateNote}
            onChange={(e) => setPrivateNote(e.target.value)}
          />
        </SectionCard>
      </div>

      <FormActions
        onCancel={() => router.back()}
        saveLabel="Save & preview report"
      />
    </form>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`chip border ${active ? "bg-charcoal text-cream border-charcoal" : "bg-warmwhite text-muted border-beige"}`}
    >
      {children}
    </button>
  );
}

function YesNo({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="rounded-xl border border-beige bg-warmwhite p-2.5">
      <div className="text-[13px] font-semibold text-brown mb-1.5 px-0.5">{label}</div>
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`flex-1 rounded-lg py-2 text-[14px] font-bold ${value ? "bg-sage text-charcoal" : "bg-beige/40 text-muted"}`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`flex-1 rounded-lg py-2 text-[14px] font-bold ${!value ? "bg-charcoal text-cream" : "bg-beige/40 text-muted"}`}
        >
          No
        </button>
      </div>
    </div>
  );
}
