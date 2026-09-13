"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Shuffle, ChefHat } from "lucide-react";
import { recipesApi } from "@/lib/api/endpoints";
import { PageContainer, PageHeader } from "@/components/common/page-container";
import { FullSpinner } from "@/components/common/spinner";
import { EmptyState } from "@/components/common/empty-state";
import { RecipeCard } from "@/widgets/RecipeCard/ui/RecipeCard";
import { Button } from "@/components/ui/button";

export default function RandomPage() {
  const [nonce, setNonce] = useState(0);
  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["recipes", "random", nonce],
    queryFn: () => recipesApi.random(),
    retry: false,
  });

  return (
    <PageContainer className="max-w-md">
      <PageHeader title="Случайный рецепт" description="Не знаете, что приготовить? Доверьтесь случаю." />

      <div className="mb-6 flex justify-center">
        <Button onClick={() => setNonce((n) => n + 1)} disabled={isFetching}>
          <Shuffle className="size-4" />
          {isFetching ? "Выбираем…" : "Показать другой"}
        </Button>
      </div>

      {isLoading ? (
        <FullSpinner />
      ) : isError || !data ? (
        <EmptyState
          icon={<ChefHat />}
          title="Рецептов пока нет"
          description="Как только появятся публичные рецепты, здесь можно будет крутить рулетку."
          action={<Button variant="outline" render={<Link href="/" />}>К списку</Button>}
        />
      ) : (
        <RecipeCard recipe={data} />
      )}
    </PageContainer>
  );
}
