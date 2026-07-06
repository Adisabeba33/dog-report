"use client";

import React from "react";
import { IconLock } from "./icons";

export function Field({
  label,
  children,
  hint,
  privateNote,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  privateNote?: boolean;
}) {
  return (
    <label className="block">
      <span className="field-label flex items-center gap-1">
        {privateNote && <IconLock width={13} height={13} className="text-[#8a6d1f]" />}
        {label}
      </span>
      {children}
      {hint && <span className="block text-[12px] text-muted mt-1">{hint}</span>}
    </label>
  );
}

export function TextField({
  label,
  hint,
  privateNote,
  ...props
}: {
  label: string;
  hint?: string;
  privateNote?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Field label={label} hint={hint} privateNote={privateNote}>
      <input className="field" {...props} />
    </Field>
  );
}

export function TextArea({
  label,
  hint,
  privateNote,
  ...props
}: {
  label: string;
  hint?: string;
  privateNote?: boolean;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Field label={label} hint={hint} privateNote={privateNote}>
      <textarea className="field min-h-[84px] resize-y" {...props} />
    </Field>
  );
}

export function SelectField({
  label,
  hint,
  children,
  ...props
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Field label={label} hint={hint}>
      <select className="field appearance-none pr-10" {...props}>
        {children}
      </select>
    </Field>
  );
}

// Sticky footer with save/cancel used across editor screens.
export function FormActions({
  onCancel,
  saveLabel = "Save",
  disabled,
  extra,
}: {
  onCancel: () => void;
  saveLabel?: string;
  disabled?: boolean;
  extra?: React.ReactNode;
}) {
  return (
    <div className="sticky bottom-0 left-0 right-0 mt-6 -mx-4 px-4 py-3 bg-cream/90 backdrop-blur-md border-t border-beige safe-bottom">
      {extra}
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="btn btn-ghost flex-1">
          Cancel
        </button>
        <button type="submit" disabled={disabled} className="btn btn-primary flex-1 disabled:opacity-50">
          {saveLabel}
        </button>
      </div>
    </div>
  );
}

export function SectionCard({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-4 space-y-4">
      {title && <h2 className="section-title">{title}</h2>}
      {children}
    </section>
  );
}
