"use client";


import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import ClientForm from "@/components/ClientForm";
import { PageHeader, EmptyState } from "@/components/ui";

function EditClientPage() {
  const id = useSearchParams().get("id") ?? "";
  const { getClient } = useStore();
  const client = getClient(id);
  if (!client) {
    return (
      <div>
        <PageHeader title="Edit Client" back />
        <EmptyState title="Client not found" />
      </div>
    );
  }
  return <ClientForm existing={client} />;
}


export default function Page() {
  return (
    <Suspense fallback={null}>
      <EditClientPage />
    </Suspense>
  );
}
