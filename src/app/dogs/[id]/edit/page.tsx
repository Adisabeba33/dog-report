"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import DogForm from "@/components/DogForm";
import { PageHeader, EmptyState } from "@/components/ui";

export default function EditDogPage() {
  const { id } = useParams<{ id: string }>();
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
