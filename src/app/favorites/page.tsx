"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { RecipeListFilter } from "@/lib/api/types";
import { useFavorites } from "@/lib/hooks/use-recipes";
import { useAuth } from "@/lib/auth/auth-context";
import { RequireAuth } from "@/components/common/require-auth";
import { PageContainer, PageHeader } from "@/components/common/page-container";
import { RecipeGrid, RecipeGridSkeleton } from "@/widgets/RecipeCard/ui/RecipeGrid";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";

function FavoritesInner() {
  const { isAuthenticated } = useAuth();
  const [filter] = useState<RecipeListFilter>({ limit: 100 });
  const { data, isLoading } = useFavorites(filter, isAuthenticated);
  const items = data?.items ?? [];

  return (
    <PageContainer>
      <PageHeader title="Избранное" description="Рецепты, которые вы сохранили." />
      {isLoading ? (
        <RecipeGridSkeleton />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Heart />}
          title="Список избранного пуст"
          description="Добавляйте понравившиеся рецепты кнопкой с сердечком."
          action={<Button render={<Link href="/" />}>К рецептам</Button>}
        />
      ) : (
        <RecipeGrid recipes={items} />
      )}
    </PageContainer>
  );
}

export default function FavoritesPage() {
  return (
    <RequireAuth>
      <FavoritesInner />
    </RequireAuth>
  );
}
