"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Users,
  Flame,
  Heart,
  Pencil,
  Trash2,
  ChefHat,
  Globe,
  Lock,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useRecipe, useDeleteRecipe, useToggleFavorite } from "@/lib/hooks/use-recipes";
import { apiErrorMessage } from "@/lib/api/client";
import {
  DIFFICULTY_LABELS,
  MEAL_TYPE_OPTIONS,
  formatMinutes,
  formatServings,
} from "@/lib/format";
import { PageContainer } from "@/components/common/page-container";
import { FullSpinner } from "@/components/common/spinner";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function mealTypeLabel(value: string) {
  return MEAL_TYPE_OPTIONS.find((m) => m.value === value)?.label ?? value;
}

function RecipeView() {
  const params = useSearchParams();
  const id = params.get("id");
  const router = useRouter();
  const { user } = useAuth();
  const { data: recipe, isLoading, isError } = useRecipe(id);
  const toggle = useToggleFavorite();
  const del = useDeleteRecipe();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!id) {
    return (
      <PageContainer>
        <EmptyState title="Рецепт не выбран" description="Не указан идентификатор рецепта." />
      </PageContainer>
    );
  }
  if (isLoading) return <FullSpinner label="Загрузка рецепта…" />;
  if (isError || !recipe) {
    return (
      <PageContainer>
        <EmptyState
          icon={<ChefHat />}
          title="Рецепт не найден"
          description="Возможно, он был удалён или недоступен."
          action={<Button render={<Link href="/" />}>На главную</Button>}
        />
      </PageContainer>
    );
  }

  const isAuthor = user?.id === recipe.author_id;

  const onFavorite = () =>
    toggle.mutate(
      { id: recipe.id, favorite: !!recipe.is_favorite },
      {
        onSuccess: () =>
          toast.success(recipe.is_favorite ? "Убрано из избранного" : "Добавлено в избранное"),
        onError: (err) => toast.error(apiErrorMessage(err)),
      }
    );

  const onDelete = () =>
    del.mutate(recipe.id, {
      onSuccess: () => {
        toast.success("Рецепт удалён");
        router.push("/my");
      },
      onError: (err) => toast.error(apiErrorMessage(err)),
    });

  return (
    <PageContainer className="max-w-3xl">
      <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="size-4" />
        Назад
      </Button>

      {recipe.image_url && (
        <div className="mb-6 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={recipe.image_url} alt={recipe.title} className="size-full object-cover" />
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {recipe.category?.name && <Badge variant="secondary">{recipe.category.name}</Badge>}
              <Badge variant="outline">
                {recipe.is_public ? (
                  <>
                    <Globe className="size-3" /> Публичный
                  </>
                ) : (
                  <>
                    <Lock className="size-3" /> Приватный
                  </>
                )}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{recipe.title}</h1>
          </div>

          <div className="flex gap-2">
            {user && (
              <Button
                variant={recipe.is_favorite ? "secondary" : "outline"}
                onClick={onFavorite}
                disabled={toggle.isPending}
              >
                <Heart className={cn("size-4", recipe.is_favorite && "fill-destructive text-destructive")} />
                {recipe.is_favorite ? "В избранном" : "В избранное"}
              </Button>
            )}
            {isAuthor && (
              <>
                <Button variant="outline" size="icon" render={<Link href={`/edit?id=${recipe.id}`} />} aria-label="Редактировать">
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setConfirmOpen(true)}
                  aria-label="Удалить"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </>
            )}
          </div>
        </div>

        {recipe.description && (
          <p className="text-muted-foreground">{recipe.description}</p>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetaTile icon={<Clock className="size-4" />} label="Общее время" value={formatMinutes(recipe.prep_time_minutes + recipe.cook_time_minutes)} />
          <MetaTile icon={<Flame className="size-4" />} label="Сложность" value={DIFFICULTY_LABELS[recipe.difficulty]} />
          <MetaTile icon={<Users className="size-4" />} label="Порции" value={formatServings(recipe.servings)} />
          {recipe.meal_type && <MetaTile icon={<ChefHat className="size-4" />} label="Тип" value={mealTypeLabel(recipe.meal_type)} />}
          {recipe.cuisine && <MetaTile icon={<Globe className="size-4" />} label="Кухня" value={recipe.cuisine} />}
        </div>

        {!!recipe.tags?.length && (
          <div className="flex flex-wrap gap-1.5">
            {recipe.tags.map((t) => (
              <Badge key={t.id} variant="muted">
                #{t.name}
              </Badge>
            ))}
          </div>
        )}

        <Separator className="my-2" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[280px_1fr]">
          <div>
            <h2 className="mb-3 text-lg font-semibold">Ингредиенты</h2>
            <Card>
              <CardContent className="flex flex-col gap-2">
                {recipe.ingredients?.length ? (
                  recipe.ingredients.map((ing, i) => (
                    <div key={i} className="flex items-baseline justify-between gap-2 text-sm">
                      <span>{ing.name}</span>
                      <span className="shrink-0 text-muted-foreground">
                        {[ing.amount, ing.unit].filter(Boolean).join(" ")}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Не указаны</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold">Приготовление</h2>
            <ol className="flex flex-col gap-4">
              {recipe.instructions?.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {i + 1}
                  </span>
                  <p className="pt-0.5 text-sm leading-relaxed">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {recipe.source_url && (
          <a
            href={recipe.source_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ExternalLink className="size-4" /> Источник рецепта
          </a>
        )}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Удалить рецепт?</DialogTitle>
            <DialogDescription>
              Рецепт «{recipe.title}» будет удалён без возможности восстановления.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Отмена</Button>} />
            <Button variant="destructive" onClick={onDelete} disabled={del.isPending}>
              {del.isPending ? "Удаление…" : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

function MetaTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border bg-card p-3">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default function RecipePage() {
  return (
    <Suspense fallback={<FullSpinner />}>
      <RecipeView />
    </Suspense>
  );
}
