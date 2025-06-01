import { Suspense } from "react";
import AuthErrorPage from "@/components/AuthErrorPage";

export default function AuthErrorRoute() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorPage />
    </Suspense>
  );
}
