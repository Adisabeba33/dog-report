"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import DogForm from "@/components/DogForm";
import { PageHeader, EmptyState } from "@/components/ui";

function EditDogPage() {
  const id = useSearchParams().get("id") ?? "";
  const { getDog } = useStore();
  const dog = getDog(id);
  if (!dog) {
    return (
      <div>
        <PageHeader title="Edit Dog" back />
        <EmptyState title="Dog not found" />
      </div>
    );
  }
  return (
    <Suspense fallback={null}>
      <DogForm existing={dog} />
    </Suspense>
  );
}


export default function Page() {
  return (
    <Suspense fallback={null}>
      <EditDogPage />
    </Suspense>
  );
}
