"use client";

import { useState } from "react";
import Link from "next/link";
import { UtensilsCrossed, Shuffle, PlusCircle, Sparkles } from "lucide-react";
import type { RecipeListFilter } from "@/lib/api/types";
import { useRecipesList } from "@/lib/hooks/use-recipes";
import { PageContainer } from "@/components/common/page-container";
import { Filters } from "@/widgets/Filters/ui/Filters";
import { RecipeGrid, RecipeGridSkeleton } from "@/widgets/RecipeCard/ui/RecipeGrid";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";

const PAGE = 24;

export default function HomePage() {
  const [filter, setFilter] = useState<RecipeListFilter>({});
  const [limit, setLimit] = useState(PAGE);

  const { data, isLoading, isError } = useRecipesList({ ...filter, limit, offset: 0 });

  const onFilterChange = (next: RecipeListFilter) => {
    setLimit(PAGE);
    setFilter(next);
  };

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <PageContainer>
      <section className="relative mb-8 overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-primary/90 to-[color-mix(in_oklch,var(--primary),#d64d1e_55%)] px-6 py-10 text-primary-foreground shadow-lg sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -right-10 -top-16 size-56 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 size-56 rounded-full bg-black/10 blur-2xl" />
        <div className="relative max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
            <Sparkles className="size-3.5" />
            Готовьте с удовольствием
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Найдите рецепт на любой случай
          </h1>
          <p className="mt-2 max-w-md text-sm text-primary-foreground/85 sm:text-base">
            Сотни идей от сообщества — от быстрых завтраков до праздничных ужинов.
            Сохраняйте любимое и делитесь своими рецептами.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="secondary" render={<Link href="/random" />}>
              <Shuffle className="size-4" />
              Случайный рецепт
            </Button>
            <Button
              variant="secondary"
              className="bg-white/15 text-primary-foreground hover:bg-white/25"
              render={<Link href="/create" />}
            >
              <PlusCircle className="size-4" />
              Добавить свой
            </Button>
          </div>
        </div>
      </section>

      <div className="mb-6">
        <Filters value={filter} onChange={onFilterChange} />
      </div>

      {isLoading ? (
        <RecipeGridSkeleton />
      ) : isError ? (
        <EmptyState
          icon={<UtensilsCrossed />}
          title="Не удалось загрузить рецепты"
          description="Проверьте соединение и попробуйте обновить страницу."
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed />}
          title="Рецепты не найдены"
          description="Попробуйте изменить фильтры или сбросить их."
        />
      ) : (
        <>
          <RecipeGrid recipes={items} />
          {items.length < total && (
            <div className="mt-8 flex justify-center">
              <Button variant="outline" onClick={() => setLimit((l) => l + PAGE)}>
                Показать ещё
              </Button>
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}
