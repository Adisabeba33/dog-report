"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import type { Mood, Energy } from "@/lib/types";
import { PageHeader, EmptyState, DogAvatar } from "@/components/ui";
import { MultiPhotoInput } from "@/components/PhotoInput";
import { formatLongDate, formatTime, minutesBetween, addMinutesToTime, isoToLocalTime, formatWindow } from "@/lib/date";
import {
  IconPaw,
  IconReport,
  IconChevron,
  IconLock,
  IconLeaf,
  IconBars,
  IconBolt,
  IconDroplet,
  IconWater,
  IconPoop,
  IconBowl,
  IconTowel,
  IconPill,
} from "@/components/icons";

const MOODS: Mood[] = ["Happy", "Calm", "Excited", "Tired", "Nervous", "Playful"];
const ENERGIES: { key: Energy; Icon: typeof IconLeaf }[] = [
  { key: "Low", Icon: IconLeaf },
  { key: "Medium", Icon: IconBars },
  { key: "High", Icon: IconBolt },
];
const SAGE = "#5F754D";

function CompleteWalkInner() {
  const id = useSearchParams().get("id") ?? "";
  const router = useRouter();
  const { getWalk, getDog, db, addReport, updateReport, reportForWalk } = useStore();

  const walk = getWalk(id);
  const existingReport = walk ? reportForWalk(walk.id) : undefined;
  const dog = getDog(walk?.dog_id ?? "");

  // Actual walk time (precise, shown to the owner). Defaults from the Start
  // Walk timestamp if the walk was started, otherwise the window's start.
  const defaultStart =
    existingReport?.actual_start_time ||
    (walk?.actual_start_time ? isoToLocalTime(walk.actual_start_time) : walk?.window_start) ||
    "09:00";
  const defaultEnd =
    existingReport?.actual_end_time ||
    addMinutesToTime(defaultStart, walk?.duration_minutes ?? 30);

  const [startT, setStartT] = useState(defaultStart);
  const [endT, setEndT] = useState(defaultEnd);
  const [mood, setMood] = useState<Mood | "">(existingReport?.mood ?? "Happy");
  const [energy, setEnergy] = useState<Energy | "">(existingReport?.energy ?? "Medium");
  const [pee, setPee] = useState(existingReport?.pee ?? true);
  const [poop, setPoop] = useState(existingReport?.poop ?? true);
  const [water, setWater] = useState(existingReport?.water ?? true);
  const [food, setFood] = useState(existingReport?.food ?? false);
  const [towel, setTowel] = useState(existingReport?.towel_dry ?? false);
  const [meds, setMeds] = useState(existingReport?.meds ?? false);
  const [photos, setPhotos] = useState<string[]>(existingReport?.photos ?? []);
  const [publicNote, setPublicNote] = useState(existingReport?.public_note ?? "");
  const [privateNote, setPrivateNote] = useState(existingReport?.private_note ?? walk?.private_notes ?? "");
  const [showPrivate, setShowPrivate] = useState(!!existingReport?.private_note);

  const duration = useMemo(() => minutesBetween(startT, endT), [startT, endT]);

  if (!walk) {
    return (
      <div>
        <PageHeader title="Write Report" back />
        <EmptyState title="Walk not found" />
      </div>
    );
  }

  const applyTemplate = (text: string) =>
    setPublicNote((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text));

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
      towel_dry: towel,
      meds,
      public_note: publicNote,
      private_note: privateNote,
      photos,
    };
    if (existingReport) {
      updateReport(existingReport.id, data);
      router.push(`/reports/detail?id=${existingReport.id}`);
    } else {
      const r = addReport(data);
      router.push(`/reports/detail?id=${r.id}`);
    }
  };

  const essentials: [string, typeof IconDroplet, boolean, (v: boolean) => void][] = [
    ["Pee", IconDroplet, pee, setPee],
    ["Poop", IconPoop, poop, setPoop],
    ["Water", IconWater, water, setWater],
    ["Food", IconBowl, food, setFood],
    ["Towel dry", IconTowel, towel, setTowel],
    ["Meds", IconPill, meds, setMeds],
  ];

  return (
    <form onSubmit={submit} className="pb-28">
      <PageHeader title="Write Report" back />

      <div className="px-5 space-y-4">
        {/* Summary card */}
        <div
          className="rounded-3xl border p-3.5 flex items-center gap-3.5"
          style={{ backgroundColor: "#F1EFE3", borderColor: "#E1DAC9" }}
        >
          <DogAvatar name={dog?.name ?? "?"} photo={dog?.photo_url} size={62} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-[20px] font-extrabold text-charcoal">{dog?.name}</span>
              <IconPaw width={16} height={16} className="text-sage" />
            </div>
            <div className="text-[13px]" style={{ color: "#9A7A4F" }}>{formatLongDate(walk.scheduled_date)}</div>
            <div className="text-[13px] text-charcoal mt-0.5">
              {formatWindow(walk.window_start, walk.window_end)}
              <span className="text-muted"> · {walk.duration_minutes} min</span>
            </div>
          </div>
        </div>

        {/* Walk time (actual, shown to owner) */}
        <Section title="Walk time">
          <div className="flex items-center gap-2">
            <input
              type="time"
              aria-label="Started"
              value={startT}
              onChange={(e) => setStartT(e.target.value)}
              className="field !py-3 flex-1"
            />
            <span className="text-muted text-[14px] shrink-0">to</span>
            <input
              type="time"
              aria-label="Ended"
              value={endT}
              onChange={(e) => setEndT(e.target.value)}
              className="field !py-3 flex-1"
            />
          </div>
          <p className="text-[12px] text-muted mt-2">
            The real time you walked — shown to the owner. {duration} min total.
          </p>
        </Section>

        {/* Photos */}
        <Section title="Add Photos">
          <MultiPhotoInput values={photos} onChange={setPhotos} max={5} />
          {photos.length === 0 && (
            <p className="text-[12px] text-muted mt-2">The first photo becomes the report’s hero image.</p>
          )}
        </Section>

        {/* Mood + energy */}
        <Section title={`How was ${dog?.name ?? "the walk"}?`}>
          <div>
            <div className="text-[13px] font-semibold text-brown mb-2">Mood</div>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <Chip key={m} active={mood === m} onClick={() => setMood(mood === m ? "" : m)}>
                  {m}
                </Chip>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <div className="text-[13px] font-semibold text-brown mb-2">Energy</div>
            <div className="flex gap-2">
              {ENERGIES.map(({ key, Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setEnergy(energy === key ? "" : key)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[15px] font-semibold border transition-colors"
                  style={
                    energy === key
                      ? { backgroundColor: SAGE, color: "#fff", borderColor: SAGE }
                      : { backgroundColor: "#FFFDF8", color: "#8A8176", borderColor: "#E6DDD0" }
                  }
                >
                  <Icon width={16} height={16} /> {key}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Essentials */}
        <Section title="Essentials">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            {essentials.map(([label, Icon, val, setVal]) => (
              <div key={label} className="flex items-center gap-2">
                <Icon width={18} height={18} className="text-brown/70 shrink-0" />
                <span className="text-[14px] text-charcoal flex-1 truncate">{label}</span>
                <button
                  type="button"
                  onClick={() => setVal(!val)}
                  className="rounded-full text-[13px] font-bold px-3.5 py-1 min-w-[52px] transition-colors"
                  style={
                    val
                      ? { backgroundColor: SAGE, color: "#fff" }
                      : { backgroundColor: "#EFE7D8", color: "#8b7a5e" }
                  }
                >
                  {val ? "Yes" : "No"}
                </button>
              </div>
            ))}
          </div>
        </Section>

        {/* Note to owner */}
        <Section title="Note to owner">
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
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
          <div className="relative mt-2">
            <textarea
              value={publicNote}
              maxLength={300}
              onChange={(e) => setPublicNote(e.target.value)}
              placeholder="Luna had a great walk today…"
              className="field min-h-[120px] resize-y !pb-7"
            />
            <span className="absolute right-3 bottom-2.5 text-[12px] text-muted">{publicNote.length}/300</span>
          </div>
        </Section>

        {/* Private note (collapsed) */}
        <div className="card overflow-hidden">
          <button
            type="button"
            onClick={() => setShowPrivate((v) => !v)}
            className="w-full flex items-center gap-2 px-4 py-3.5 text-left"
          >
            <IconLock width={15} height={15} className="text-[#8a6d1f]" />
            <span className="text-[14px] font-semibold text-charcoal flex-1">
              Private note <span className="text-muted font-normal">— not shared with owner</span>
            </span>
            <IconChevron width={16} height={16} className={`text-muted transition-transform ${showPrivate ? "rotate-90" : ""}`} />
          </button>
          {showPrivate && (
            <div className="px-4 pb-4">
              <textarea
                value={privateNote}
                onChange={(e) => setPrivateNote(e.target.value)}
                placeholder="Only visible to you. Never appears in the report."
                className="field min-h-[80px] resize-y"
                style={{ backgroundColor: "#F7EED8", borderColor: "#E7D9B4" }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Sticky generate button */}
      <div className="fixed bottom-0 inset-x-0 z-30 px-5 py-3 bg-cream/92 backdrop-blur-md border-t border-beige safe-bottom">
        <div className="mx-auto max-w-md">
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl py-4 text-[16px] font-bold text-white active:opacity-90"
            style={{ backgroundColor: SAGE }}
          >
            <IconReport width={19} height={19} /> Generate Report
          </button>
        </div>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-4">
      <h2 className="font-display text-[16px] font-bold text-charcoal mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-4 py-2 text-[14px] font-semibold border transition-colors"
      style={
        active
          ? { backgroundColor: SAGE, color: "#fff", borderColor: SAGE }
          : { backgroundColor: "#FFFDF8", color: "#25221E", borderColor: "#E6DDD0" }
      }
    >
      {children}
    </button>
  );
}

export default function CompleteWalkPage() {
  return (
    <Suspense fallback={null}>
      <CompleteWalkInner />
    </Suspense>
  );
}
