"use client";

import { useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/ui";
import { TextField, TextArea, SelectField, SectionCard, Field } from "@/components/form";
import { IconPlus, IconTrash, IconDownload } from "@/components/icons";

const ACCENTS = [
  { name: "Sage", value: "#9CAF88" },
  { name: "Brown", value: "#8B6F56" },
  { name: "Gold", value: "#D8B56D" },
  { name: "Charcoal", value: "#25221E" },
];

export default function SettingsPage() {
  const { db, updateSettings, addTemplate, updateTemplate, deleteTemplate, exportJSON, resetDemo, clearAll } = useStore();
  const s = db.settings;
  const logoRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState("");

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 2500);
  };

  const handleLogo = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateSettings({ logo_url: reader.result as string });
    reader.readAsDataURL(file);
  };

  const handleExport = () => {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "walk-report-data.json";
    a.click();
    URL.revokeObjectURL(url);
    flash("Data exported");
  };

  return (
    <div>
      <PageHeader title="Settings" />

      <div className="px-4 space-y-4">
        <SectionCard title="Business">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-beige/60 overflow-hidden flex items-center justify-center">
              {s.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.logo_url} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <span className="text-brown font-display font-bold text-xl">
                  {(s.business_name || "?").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => logoRef.current?.click()} className="btn btn-ghost !py-2.5">
                {s.logo_url ? "Change logo" : "Upload logo"}
              </button>
              {s.logo_url && (
                <button onClick={() => updateSettings({ logo_url: "" })} className="btn btn-ghost !px-3 !py-2.5 text-red-600">
                  <IconTrash width={18} height={18} />
                </button>
              )}
            </div>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleLogo(e.target.files?.[0])} />
          </div>
          <TextField
            label="Business name"
            placeholder="e.g. Happy Paws Walks"
            value={s.business_name}
            onChange={(e) => updateSettings({ business_name: e.target.value })}
          />
          <TextField
            label="Your name"
            value={s.walker_name}
            onChange={(e) => updateSettings({ walker_name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Phone" type="tel" value={s.phone} onChange={(e) => updateSettings({ phone: e.target.value })} />
            <TextField label="Email" type="email" value={s.email} onChange={(e) => updateSettings({ email: e.target.value })} />
          </div>
        </SectionCard>

        <SectionCard title="Reports">
          <TextField
            label="Report signature"
            hint="Shown at the bottom of every report."
            value={s.default_signature}
            onChange={(e) => updateSettings({ default_signature: e.target.value })}
          />
          <SelectField
            label="Default walk duration"
            value={String(s.default_duration_minutes)}
            onChange={(e) => updateSettings({ default_duration_minutes: Number(e.target.value) })}
          >
            {[15, 20, 30, 45, 60, 90].map((m) => (
              <option key={m} value={m}>
                {m} minutes
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Default note template"
            value={s.default_template_id ?? ""}
            onChange={(e) => updateSettings({ default_template_id: e.target.value || null })}
          >
            <option value="">None</option>
            {db.templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </SelectField>
          <Field label="Report accent color">
            <div className="flex gap-2">
              {ACCENTS.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => updateSettings({ accent: a.value })}
                  className={`flex-1 rounded-xl py-2.5 text-[12px] font-semibold border-2 ${
                    s.accent === a.value ? "border-charcoal" : "border-transparent"
                  }`}
                  style={{ backgroundColor: a.value, color: a.value === "#D8B56D" ? "#25221E" : "#FFFDF8" }}
                >
                  {a.name}
                </button>
              ))}
            </div>
          </Field>
        </SectionCard>

        <TemplatesEditor
          templates={db.templates}
          onAdd={addTemplate}
          onUpdate={updateTemplate}
          onDelete={deleteTemplate}
        />

        <SectionCard title="Data">
          <button onClick={handleExport} className="btn btn-ghost w-full">
            <IconDownload width={18} height={18} /> Export data (JSON)
          </button>
          <button
            onClick={() => {
              if (confirm("Load the demo dataset? This replaces your current data.")) {
                resetDemo();
                flash("Demo data loaded");
              }
            }}
            className="btn btn-ghost w-full"
          >
            Load demo data
          </button>
          <button
            onClick={() => {
              if (confirm("Clear all clients, dogs, walks and reports? This cannot be undone.")) {
                clearAll();
                flash("All data cleared");
              }
            }}
            className="btn btn-danger w-full"
          >
            Clear all data
          </button>
        </SectionCard>

        <p className="text-center text-[12px] text-muted pb-4">
          Walk Report · data is stored privately on this device.
        </p>
      </div>

      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-28 z-50 bg-charcoal text-cream text-[14px] px-4 py-2.5 rounded-full shadow-card">
          {toast}
        </div>
      )}
    </div>
  );
}

function TemplatesEditor({
  templates,
  onAdd,
  onUpdate,
  onDelete,
}: {
  templates: ReturnType<typeof useStore>["db"]["templates"];
  onAdd: ReturnType<typeof useStore>["addTemplate"];
  onUpdate: ReturnType<typeof useStore>["updateTemplate"];
  onDelete: ReturnType<typeof useStore>["deleteTemplate"];
}) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  return (
    <SectionCard title="Note templates">
      <div className="space-y-2">
        {templates.map((t) => (
          <div key={t.id} className="rounded-xl border border-beige bg-warmwhite p-3">
            <div className="flex items-start justify-between gap-2">
              <input
                value={t.title}
                onChange={(e) => onUpdate(t.id, { title: e.target.value })}
                className="font-semibold text-charcoal bg-transparent outline-none flex-1 min-w-0"
              />
              <button onClick={() => onDelete(t.id)} aria-label="Delete template" className="text-red-500 shrink-0">
                <IconTrash width={16} height={16} />
              </button>
            </div>
            <textarea
              value={t.text}
              onChange={(e) => onUpdate(t.id, { text: e.target.value })}
              className="w-full bg-transparent outline-none text-[14px] text-muted resize-none mt-1"
              rows={2}
            />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-dashed border-beige p-3 space-y-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Template title"
          className="field !py-2.5"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Template text"
          className="field !py-2.5 min-h-[60px]"
        />
        <button
          type="button"
          onClick={() => {
            if (!title.trim() || !text.trim()) return;
            onAdd({ title: title.trim(), text: text.trim(), category: "Custom" });
            setTitle("");
            setText("");
          }}
          className="btn btn-accent w-full !py-2.5"
        >
          <IconPlus width={16} height={16} /> Add template
        </button>
      </div>
    </SectionCard>
  );
}
