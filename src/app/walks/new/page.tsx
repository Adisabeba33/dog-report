import { Suspense } from "react";
import WalkForm from "@/components/WalkForm";

export default function NewWalkPage() {
  return (
    <Suspense fallback={null}>
      <WalkForm />
    </Suspense>
  );
}
