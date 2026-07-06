"use client";

import { useRouter } from "next/navigation";
import type { Walk } from "@/lib/types";
import { useStore } from "@/lib/store";
import { formatTime } from "@/lib/date";
import { DogAvatar, StatusBadge } from "./ui";
import {
  IconPlay,
  IconCheck,
  IconClock,
  IconPin,
  IconLock,
  IconEdit,
} from "./icons";

// A single walk card used on the Today screen. Shows the essentials at a
// glance and surfaces the most relevant one-tap action for the status.
export default function WalkCard({ walk }: { walk: Walk }) {
  const router = useRouter();
  const { getDog, getClient, startWalk } = useStore();
  const dog = getDog(walk.dog_id);
  const client = getClient(walk.client_id);
  const address = walk.address_override || client?.address || "";

  return (
    <div className="card p-3.5">
      <div className="flex gap-3">
        <div className="flex flex-col items-center pt-0.5 w-14 shrink-0">
          <span className="font-display font-extrabold text-[15px] text-charcoal leading-tight text-center">
            {formatTime(walk.scheduled_start_time)}
          </span>
          <span className="text-[11px] text-muted mt-0.5">{walk.duration_minutes} min</span>
        </div>

        <button
          onClick={() => router.push(`/dogs/${dog?.id ?? ""}`)}
          className="shrink-0"
          aria-label={`Open ${dog?.name}`}
        >
          <DogAvatar name={dog?.name ?? "?"} photo={dog?.photo_url} size={52} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-display font-bold text-[17px] text-charcoal leading-tight truncate">
                {dog?.name ?? "Unknown dog"}
              </h3>
              <p className="text-[13px] text-muted truncate">
                {client?.owner_name ?? ""}
              </p>
            </div>
            <StatusBadge status={walk.status} />
          </div>

          {address && (
            <p className="mt-1.5 flex items-center gap-1 text-[13px] text-brown/90">
              <IconPin width={14} height={14} className="shrink-0" />
              <span className="truncate">{address}</span>
            </p>
          )}

          {walk.private_notes && (
            <p className="mt-1.5 flex items-start gap-1 text-[13px] text-[#8a6d1f] bg-gold/15 rounded-lg px-2 py-1.5">
              <IconLock width={13} height={13} className="shrink-0 mt-0.5" />
              <span className="line-clamp-2">{walk.private_notes}</span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {walk.status === "scheduled" && (
          <>
            <button
              onClick={() => startWalk(walk.id)}
              className="btn btn-accent flex-1 !py-2.5"
            >
              <IconPlay width={18} height={18} /> Start
            </button>
            <button
              onClick={() => router.push(`/walks/${walk.id}/complete`)}
              className="btn btn-primary flex-1 !py-2.5"
            >
              <IconCheck width={18} height={18} /> Complete
            </button>
          </>
        )}
        {walk.status === "in_progress" && (
          <button
            onClick={() => router.push(`/walks/${walk.id}/complete`)}
            className="btn btn-primary flex-1 !py-2.5"
          >
            <IconCheck width={18} height={18} /> Complete walk
          </button>
        )}
        {walk.status === "completed" && (
          <CompletedActions walkId={walk.id} />
        )}
        {(walk.status === "canceled" || walk.status === "skipped") && (
          <button
            onClick={() => router.push(`/walks/${walk.id}/edit`)}
            className="btn btn-ghost flex-1 !py-2.5"
          >
            <IconEdit width={16} height={16} /> Edit
          </button>
        )}
        {walk.status !== "completed" && (
          <button
            onClick={() => router.push(`/walks/${walk.id}/edit`)}
            aria-label="Edit walk"
            className="btn btn-ghost !px-3 !py-2.5"
          >
            <IconEdit width={18} height={18} />
          </button>
        )}
      </div>
    </div>
  );
}

function CompletedActions({ walkId }: { walkId: string }) {
  const router = useRouter();
  const { reportForWalk } = useStore();
  const report = reportForWalk(walkId);
  return (
    <>
      <button
        onClick={() =>
          router.push(report ? `/reports/${report.id}` : `/walks/${walkId}/complete`)
        }
        className="btn btn-accent flex-1 !py-2.5"
      >
        <IconClock width={16} height={16} /> View report
      </button>
    </>
  );
}
