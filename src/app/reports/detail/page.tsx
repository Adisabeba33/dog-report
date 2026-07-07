"use client";

import { Suspense, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import ReportCard from "@/components/ReportCard";
import { PageHeader, EmptyState } from "@/components/ui";
import { nodeToPng, shareImage, downloadDataUrl, shareText } from "@/lib/image";
import { buildReportText } from "@/lib/report";
import { formatLongDate, formatTime } from "@/lib/date";
import {
  IconShare,
  IconDownload,
  IconCopy,
  IconMail,
  IconLock,
  IconEdit,
} from "@/components/icons";

const SAGE = "#5F754D";

function ReportPreviewPage() {
  const id = useSearchParams().get("id") ?? "";
  const router = useRouter();
  const { getReport, getDog, getClient, db, updateReport } = useStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<string>("");
  const [toast, setToast] = useState<string>("");

  const report = getReport(id);
  if (!report) {
    return (
      <div>
        <PageHeader title="Report Preview" back="/reports" />
        <EmptyState title="Report not found" />
      </div>
    );
  }

  const dog = getDog(report.dog_id);
  const client = getClient(report.client_id);
  const settings = db.settings;

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const generate = async (): Promise<string> => {
    if (!cardRef.current) throw new Error("no card");
    await nodeToPng(cardRef.current); // warm fonts/images
    return nodeToPng(cardRef.current);
  };
  const filename = () => `${(dog?.name || "walk").toLowerCase().replace(/\s+/g, "-")}-report.png`;

  const handleShare = async () => {
    setBusy("share");
    try {
      const png = await generate();
      const result = await shareImage(png, filename(), `${dog?.name ?? "Dog"}'s Walk Report`, buildReportText(report, dog, settings));
      markSent();
      flash(result === "shared" ? "Shared!" : "Image downloaded");
    } catch {
      flash("Could not generate image");
    } finally {
      setBusy("");
    }
  };

  const handleSave = async () => {
    setBusy("save");
    try {
      downloadDataUrl(await generate(), filename());
      flash("Image saved");
    } catch {
      flash("Could not generate image");
    } finally {
      setBusy("");
    }
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`${dog?.name ?? "Dog"}'s Walk Report — ${formatLongDate(report.date)}`);
    const body = encodeURIComponent(buildReportText(report, dog, settings));
    const to = client?.email ? encodeURIComponent(client.email) : "";
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    markSent();
  };

  const handleCopy = async () => {
    await shareText(`${dog?.name ?? "Dog"}'s Walk Report`, buildReportText(report, dog, settings));
    flash("Report text copied");
  };

  const markSent = () => {
    if (!report.sent_at) updateReport(report.id, { sent_at: new Date().toISOString() });
  };
  const toggleSent = () => {
    updateReport(report.id, { sent_at: report.sent_at ? null : new Date().toISOString() });
    flash(report.sent_at ? "Marked not sent" : "Marked as sent");
  };

  const sentLabel = report.sent_at
    ? `Sent ${formatLongDate(report.date)}`
    : "Not sent yet";

  return (
    <div className="min-h-[100dvh] pb-40">
      <PageHeader
        title="Report Preview"
        back="/reports"
        right={
          <button
            onClick={() => router.push(`/walks/complete?id=${report.walk_id}`)}
            aria-label="Edit report"
            className="h-9 w-9 flex items-center justify-center rounded-full active:bg-beige/60"
          >
            <IconEdit width={20} height={20} />
          </button>
        }
      />

      {/* Sent status */}
      <div className="px-5">
        <button
          onClick={toggleSent}
          className="chip"
          style={
            report.sent_at
              ? { backgroundColor: "#E4EDDB", color: "#4c6140" }
              : { backgroundColor: "#EFE7D8", color: "#8b7a5e" }
          }
        >
          {report.sent_at ? `✓ ${sentLabel}` : sentLabel}
        </button>
      </div>

      {/* Preview card */}
      <div className="px-5 mt-3 flex justify-center">
        <div className="shadow-card rounded-[28px] w-full max-w-[380px]">
          <ReportCard ref={cardRef} report={report} dog={dog} settings={settings} />
        </div>
      </div>

      {/* Private note — never in the image */}
      {report.private_note && (
        <div className="px-5 mt-4">
          <div className="rounded-2xl border p-4" style={{ backgroundColor: "#F7EED8", borderColor: "#E7D9B4" }}>
            <div className="flex items-center gap-1.5 text-[#8a6d1f] font-semibold text-[13px] mb-1">
              <IconLock width={14} height={14} /> Private note — not shared
            </div>
            <p className="text-[14px] text-charcoal">{report.private_note}</p>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-32 z-50 bg-charcoal text-cream text-[14px] px-4 py-2.5 rounded-full shadow-card">
          {toast}
        </div>
      )}

      {/* Actions */}
      <div className="fixed bottom-0 inset-x-0 z-30 px-5 py-3 bg-cream/92 backdrop-blur-md border-t border-beige safe-bottom">
        <div className="mx-auto max-w-md">
          <button
            onClick={handleShare}
            disabled={!!busy}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl py-4 text-[16px] font-bold text-white disabled:opacity-60 active:opacity-90"
            style={{ backgroundColor: SAGE }}
          >
            <IconShare width={19} height={19} />
            {busy === "share" ? "Preparing…" : "Share image"}
          </button>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <ActionBtn onClick={handleSave} disabled={!!busy} Icon={IconDownload} label={busy === "save" ? "…" : "Save"} />
            <ActionBtn onClick={handleEmail} Icon={IconMail} label="Email" />
            <ActionBtn onClick={handleCopy} Icon={IconCopy} label="Copy text" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({
  onClick,
  disabled,
  Icon,
  label,
}: {
  onClick: () => void;
  disabled?: boolean;
  Icon: typeof IconDownload;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center justify-center gap-1 rounded-2xl py-2.5 text-[13px] font-semibold text-charcoal disabled:opacity-60 active:opacity-80"
      style={{ backgroundColor: "#FFFDF8", border: "1px solid #E6DDD0" }}
    >
      <Icon width={19} height={19} className="text-brown" />
      {label}
    </button>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ReportPreviewPage />
    </Suspense>
  );
}
