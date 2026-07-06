"use client";

import { useRef, useState } from "react";
import { DogAvatar } from "./ui";
import { IconPlus, IconTrash } from "./icons";

// Reads a chosen image file, downscales it via canvas (max edge ~900px) and
// returns a compressed JPEG data URL. Keeps localStorage footprint small.
async function fileToResizedDataUrl(file: File, maxEdge = 900, quality = 0.82): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });
  let { width, height } = img;
  if (width > height && width > maxEdge) {
    height = Math.round((height * maxEdge) / width);
    width = maxEdge;
  } else if (height > maxEdge) {
    width = Math.round((width * maxEdge) / height);
    height = maxEdge;
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

export function DogPhotoInput({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (dataUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await fileToResizedDataUrl(file));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <DogAvatar name={name || "?"} photo={value} size={76} />
        {busy && (
          <div className="absolute inset-0 rounded-2xl bg-black/20 animate-pulse" />
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="btn btn-ghost !py-2.5"
        >
          <IconPlus width={16} height={16} /> {value ? "Change" : "Add photo"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Remove photo"
            className="btn btn-ghost !px-3 !py-2.5 text-red-600"
          >
            <IconTrash width={18} height={18} />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

export function MultiPhotoInput({
  values,
  onChange,
  max = 4,
}: {
  values: string[];
  onChange: (photos: string[]) => void;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setBusy(true);
    try {
      const room = max - values.length;
      const chosen = Array.from(files).slice(0, room);
      const urls = await Promise.all(chosen.map((f) => fileToResizedDataUrl(f, 1000)));
      onChange([...values, ...urls]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        {values.map((p, i) => (
          <div key={i} className="relative aspect-square">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p} alt="" className="h-full w-full object-cover rounded-xl bg-beige" />
            <button
              type="button"
              onClick={() => onChange(values.filter((_, idx) => idx !== i))}
              aria-label="Remove photo"
              className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-charcoal text-cream flex items-center justify-center text-xs"
            >
              ×
            </button>
          </div>
        ))}
        {values.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={`aspect-square rounded-xl border border-dashed border-beige flex items-center justify-center text-muted ${
              busy ? "animate-pulse" : ""
            }`}
          >
            <IconPlus width={22} height={22} />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
