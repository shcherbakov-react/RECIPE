"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRecipe, useUpdateRecipe } from "@/lib/hooks/use-recipes";
import { apiErrorMessage } from "@/lib/api/client";
import { RequireAuth } from "@/components/common/require-auth";
import { PageContainer, PageHeader } from "@/components/common/page-container";
import { FullSpinner } from "@/components/common/spinner";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import {
  RecipeForm,
  recipeToValues,
  valuesToInput,
  type RecipeFormValues,
} from "@/widgets/RecipeForm/ui/RecipeForm";
import { toast } from "sonner";

function EditInner() {
  const params = useSearchParams();
  const id = params.get("id");
  const router = useRouter();
  const { data: recipe, isLoading, isError } = useRecipe(id);
  const update = useUpdateRecipe();
  const [values, setValues] = useState<RecipeFormValues | null>(null);

  useEffect(() => {
    if (recipe) setValues(recipeToValues(recipe));
  }, [recipe]);

  if (!id) {
    return (
      <PageContainer>
        <EmptyState title="Рецепт не выбран" />
      </PageContainer>
    );
  }
  if (isLoading || !values) return <FullSpinner label="Загрузка…" />;
  if (isError || !recipe) {
    return (
      <PageContainer>
        <EmptyState
          title="Рецепт не найден"
          action={<Button render={<Link href="/my" />}>Мои рецепты</Button>}
        />
      </PageContainer>
    );
  }

  const submit = () => {
    update.mutate(
      { id, input: valuesToInput(values) },
      {
        onSuccess: (updated) => {
          toast.success("Изменения сохранены");
          router.push(`/recipe?id=${updated.id}`);
        },
        onError: (err) => toast.error(apiErrorMessage(err)),
      }
    );
  };

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title="Редактирование рецепта" />
      <RecipeForm
        values={values}
        onChange={setValues}
        onSubmit={submit}
        submitting={update.isPending}
        submitLabel="Сохранить изменения"
      />
    </PageContainer>
  );
}

export default function EditPage() {
  return (
    <RequireAuth>
      <Suspense fallback={<FullSpinner />}>
        <EditInner />
      </Suspense>
    </RequireAuth>
  );
}
