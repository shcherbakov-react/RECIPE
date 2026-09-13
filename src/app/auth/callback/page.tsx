"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { tokenStore } from "@/lib/api/client";
import { FullSpinner } from "@/components/common/spinner";

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const access = params.get("access_token");
    const refresh = params.get("refresh_token");
    if (access && refresh) {
      tokenStore.set({ access_token: access, refresh_token: refresh });
    }
    router.replace("/");
  }, [params, router]);

  return <FullSpinner label="Завершаем вход…" />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<FullSpinner />}>
      <CallbackInner />
    </Suspense>
  );
}
