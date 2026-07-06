"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import WalkForm from "@/components/WalkForm";
import { PageHeader, EmptyState } from "@/components/ui";

function EditWalkPage() {
  const id = useSearchParams().get("id") ?? "";
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


export default function Page() {
  return (
    <Suspense fallback={null}>
      <EditWalkPage />
    </Suspense>
  );
}
