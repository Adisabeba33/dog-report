import { Suspense } from "react";
import DogForm from "@/components/DogForm";

export default function NewDogPage() {
  return (
    <Suspense fallback={null}>
      <DogForm />
    </Suspense>
  );
}
