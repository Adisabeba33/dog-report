"use client";

import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import ClientForm from "@/components/ClientForm";
import { PageHeader, EmptyState } from "@/components/ui";

export default function EditClientPage() {
  const { id } = useParams<{ id: string }>();
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
