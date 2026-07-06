"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import WalkForm from "@/components/WalkForm";
import { PageHeader, EmptyState } from "@/components/ui";

export default function EditWalkPage() {
  const { id } = useParams<{ id: string }>();
  const { getWalk } = useStore();
  const walk = getWalk(id);
  if (!walk) {
    return (
      <div>
        <PageHeader title="Edit Walk" back />
        <EmptyState title="Walk not found" />
      </div>
    );
  }
  return (
    <Suspense fallback={null}>
      <WalkForm existing={walk} />
    </Suspense>
  );
}
