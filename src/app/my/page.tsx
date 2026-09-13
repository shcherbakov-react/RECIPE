"use client";

import { useState } from "react";
import Link from "next/link";
import { BookMarked, PlusCircle } from "lucide-react";
import type { RecipeListFilter } from "@/lib/api/types";
import { useMyRecipes } from "@/lib/hooks/use-recipes";
import { useAuth } from "@/lib/auth/auth-context";
import { RequireAuth } from "@/components/common/require-auth";
import { PageContainer, PageHeader } from "@/components/common/page-container";
import { Filters } from "@/widgets/Filters/ui/Filters";
import { RecipeGrid, RecipeGridSkeleton } from "@/widgets/RecipeCard/ui/RecipeGrid";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";

function MyInner() {
  const { isAuthenticated } = useAuth();
  const [filter, setFilter] = useState<RecipeListFilter>({});
  const { data, isLoading } = useMyRecipes({ ...filter, limit: 100 }, isAuthenticated);
  const items = data?.items ?? [];

  return (
    <PageContainer>
      <PageHeader
        title="Мои рецепты"
        description="Все рецепты, которые вы создали, включая приватные."
        actions={
          <Button render={<Link href="/create" />}>
            <PlusCircle className="size-4" />
            Добавить
          </Button>
        }
      />
      <div className="mb-6">
        <Filters value={filter} onChange={setFilter} />
      </div>
      {isLoading ? (
        <RecipeGridSkeleton />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<BookMarked />}
          title="Пока нет рецептов"
          description="Создайте свой первый рецепт — это займёт пару минут."
          action={
            <Button render={<Link href="/create" />}>
              <PlusCircle className="size-4" />
              Создать рецепт
            </Button>
          }
        />
      ) : (
        <RecipeGrid recipes={items} />
      )}
    </PageContainer>
  );
}

export default function MyPage() {
  return (
    <RequireAuth>
      <MyInner />
    </RequireAuth>
  );
}
