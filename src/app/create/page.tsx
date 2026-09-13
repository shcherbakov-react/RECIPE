"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateRecipe } from "@/lib/hooks/use-recipes";
import { apiErrorMessage } from "@/lib/api/client";
import { RequireAuth } from "@/components/common/require-auth";
import { PageContainer, PageHeader } from "@/components/common/page-container";
import {
  RecipeForm,
  emptyRecipeValues,
  valuesToInput,
  type RecipeFormValues,
} from "@/widgets/RecipeForm/ui/RecipeForm";
import { toast } from "sonner";

function CreateInner() {
  const router = useRouter();
  const create = useCreateRecipe();
  const [values, setValues] = useState<RecipeFormValues>(emptyRecipeValues);

  const submit = () => {
    create.mutate(valuesToInput(values), {
      onSuccess: (recipe) => {
        toast.success("Рецепт создан");
        router.push(`/recipe?id=${recipe.id}`);
      },
      onError: (err) => toast.error(apiErrorMessage(err)),
    });
  };

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title="Новый рецепт" description="Заполните форму и опубликуйте рецепт." />
      <RecipeForm
        values={values}
        onChange={setValues}
        onSubmit={submit}
        submitting={create.isPending}
        submitLabel="Опубликовать"
      />
    </PageContainer>
  );
}

export default function CreatePage() {
  return (
    <RequireAuth>
      <CreateInner />
    </RequireAuth>
  );
}
