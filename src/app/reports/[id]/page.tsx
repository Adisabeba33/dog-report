"use client";

import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import ReportCard from "@/components/ReportCard";
import { PageHeader, EmptyState } from "@/components/ui";
import { nodeToPng, shareImage, downloadDataUrl, shareText } from "@/lib/image";
import { buildReportText } from "@/lib/report";
import { formatLongDate } from "@/lib/date";
import {
  IconShare,
  IconDownload,
  IconCopy,
  IconMail,
  IconCheck,
  IconLock,
  IconEdit,
} from "@/components/icons";

export default function ReportPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getReport, getDog, getClient, db, updateReport } = useStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<string>("");
  const [toast, setToast] = useState<string>("");

  const report = getReport(id);
  if (!report) {
    return (
      <div>
        <PageHeader title="Report" back="/reports" />
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
    // Render twice: the first pass warms font/image embedding for crisp output.
    await nodeToPng(cardRef.current);
    return nodeToPng(cardRef.current);
  };

  const handleShare = async () => {
    setBusy("share");
    try {
      const png = await generate();
      const filename = `${(dog?.name || "walk").toLowerCase().replace(/\s+/g, "-")}-report.png`;
      const result = await shareImage(
        png,
        filename,
        `${dog?.name ?? "Dog"}'s Walk Report`,
        buildReportText(report, dog, settings),
      );
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
      const png = await generate();
      downloadDataUrl(png, `${(dog?.name || "walk").toLowerCase().replace(/\s+/g, "-")}-report.png`);
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

  return (
    <div className="min-h-[100dvh]">
      <PageHeader
        title="Report"
        back="/reports"
        right={
          <button
            onClick={() => router.push(`/walks/${report.walk_id}/complete`)}
            aria-label="Edit report"
            className="h-9 w-9 flex items-center justify-center rounded-full active:bg-beige/60"
          >
            <IconEdit width={20} height={20} />
          </button>
        }
      />

      {/* Sent status */}
      <div className="px-4">
        <button
          onClick={toggleSent}
          className={`chip ${report.sent_at ? "bg-sage/25 text-[#4c6140]" : "bg-beige text-brown"}`}
        >
          {report.sent_at ? "✓ Sent" : "Not sent yet"}
        </button>
      </div>

      {/* Preview */}
      <div className="px-4 mt-3 flex justify-center">
        <div className="shadow-card rounded-[28px]">
          <ReportCard ref={cardRef} report={report} dog={dog} settings={settings} />
        </div>
      </div>

      {/* Private note (never in the image) */}
      {report.private_note && (
        <div className="px-4 mt-4">
          <div className="rounded-2xl bg-gold/15 border border-gold/30 p-4">
            <div className="flex items-center gap-1.5 text-[#8a6d1f] font-semibold text-[13px] mb-1">
              <IconLock width={14} height={14} /> Private note — not shared
            </div>
            <p className="text-[14px] text-charcoal">{report.private_note}</p>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-28 z-50 bg-charcoal text-cream text-[14px] px-4 py-2.5 rounded-full shadow-card">
          {toast}
        </div>
      )}

      {/* Actions */}
      <div className="sticky bottom-0 mt-5 px-4 py-3 bg-cream/90 backdrop-blur-md border-t border-beige safe-bottom">
        <button
          onClick={handleShare}
          disabled={!!busy}
          className="btn btn-primary w-full mb-2 disabled:opacity-60"
        >
          <IconShare width={18} height={18} />
          {busy === "share" ? "Preparing…" : "Share image"}
        </button>
        <div className="grid grid-cols-3 gap-2">
          <button onClick={handleSave} disabled={!!busy} className="btn btn-ghost flex-col !py-2.5 text-[12px] gap-1">
            <IconDownload width={20} height={20} />
            {busy === "save" ? "…" : "Save"}
          </button>
          <button onClick={handleEmail} className="btn btn-ghost flex-col !py-2.5 text-[12px] gap-1">
            <IconMail width={20} height={20} />
            Email
          </button>
          <button onClick={handleCopy} className="btn btn-ghost flex-col !py-2.5 text-[12px] gap-1">
            <IconCopy width={20} height={20} />
            Copy text
          </button>
        </div>
      </div>
    </div>
  );
}
