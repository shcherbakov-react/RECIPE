"use client";

import { BASE_URL } from "@/lib/api/client";

/**
 * OAuth-вход. Ведёт на бэкенд, который редиректит на провайдера,
 * а затем обратно на /auth/callback с токенами в query.
 */
export function OAuthButtons() {
  const yandexUrl = `${BASE_URL}/api/v1/auth/oauth/yandex`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">или</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <a
        href={yandexUrl}
        className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-input bg-background text-sm font-medium shadow-sm transition-colors outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span className="flex size-5 items-center justify-center rounded-full bg-[#FC3F1D] text-[13px] font-bold leading-none text-white">
          Я
        </span>
        Войти через Яндекс
      </a>
    </div>
  );
}
