"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";
import { useSearchRecipes } from "@/lib/hooks/use-recipes";
import { PageContainer, PageHeader } from "@/components/common/page-container";
import { RecipeGrid, RecipeGridSkeleton } from "@/widgets/RecipeCard/ui/RecipeGrid";
import { EmptyState } from "@/components/common/empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function SearchInner() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get("q") ?? "";
  const [term, setTerm] = useState(initial);
  const [query, setQuery] = useState(initial);

  useEffect(() => {
    setTerm(initial);
    setQuery(initial);
  }, [initial]);

  const { data, isLoading, isFetching } = useSearchRecipes(query, query.trim().length > 0);
  const items = data?.recipes?.items ?? [];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = term.trim();
    setQuery(value);
    router.replace(value ? `/search?q=${encodeURIComponent(value)}` : "/search");
  };

  return (
    <PageContainer>
      <PageHeader title="Поиск рецептов" />

      <form onSubmit={submit} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Введите название или ингредиент…"
            className="pl-9"
            autoFocus
          />
        </div>
        <Button type="submit">Найти</Button>
      </form>

      {!query.trim() ? (
        <EmptyState
          icon={<SearchIcon />}
          title="Начните поиск"
          description="Введите запрос, чтобы найти рецепты по названию или описанию."
        />
      ) : isLoading || isFetching ? (
        <RecipeGridSkeleton count={3} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<SearchIcon />}
          title="Ничего не найдено"
          description={`По запросу «${query}» рецептов нет. Попробуйте другой запрос.`}
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            Найдено рецептов: {data?.recipes?.total ?? items.length}
          </p>
          <RecipeGrid recipes={items} />
        </>
      )}
    </PageContainer>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<RecipeGridSkeleton count={3} />}>
      <SearchInner />
    </Suspense>
  );
}
