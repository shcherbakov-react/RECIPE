"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { FullSpinner } from "@/components/common/spinner";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <FullSpinner label="Загрузка…" />;

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={<LogIn />}
        title="Требуется вход"
        description="Войдите в аккаунт, чтобы пользоваться этим разделом."
        action={
          <Button render={<Link href="/login" />}>Войти</Button>
        }
      />
    );
  }

  return <>{children}</>;
}
