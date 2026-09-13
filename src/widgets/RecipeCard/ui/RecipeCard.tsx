"use client";

import Link from "next/link";
import { Clock, Users, Heart, Eye, ChefHat } from "lucide-react";
import type { Recipe } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DIFFICULTY_BADGE, DIFFICULTY_LABELS, formatMinutes, totalTime } from "@/lib/format";
import { useAuth } from "@/lib/auth/auth-context";
import { useToggleFavorite } from "@/lib/hooks/use-recipes";
import { apiErrorMessage } from "@/lib/api/client";
import { toast } from "sonner";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const { isAuthenticated } = useAuth();
  const toggle = useToggleFavorite();

  const onFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle.mutate(
      { id: recipe.id, favorite: !!recipe.is_favorite },
      {
        onSuccess: () =>
          toast.success(recipe.is_favorite ? "Убрано из избранного" : "Добавлено в избранное"),
        onError: (err) => toast.error(apiErrorMessage(err)),
      }
    );
  };

  return (
    <Card className="group gap-0 overflow-hidden rounded-2xl border-border/60 py-0 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/recipe?id=${recipe.id}`} className="flex h-full flex-col">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
          {recipe.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground/40">
              <ChefHat className="size-10" />
            </div>
          )}

          {isAuthenticated && (
            <button
              type="button"
              onClick={onFavorite}
              disabled={toggle.isPending}
              aria-label="В избранное"
              className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background disabled:opacity-50"
            >
              <Heart
                className={cn(
                  "size-4.5 transition-colors",
                  recipe.is_favorite && "fill-destructive text-destructive"
                )}
              />
            </button>
          )}

          {recipe.difficulty && (
            <Badge className={cn("absolute left-3 top-3 shadow-sm", DIFFICULTY_BADGE[recipe.difficulty])}>
              {DIFFICULTY_LABELS[recipe.difficulty]}
            </Badge>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          {recipe.category?.name && (
            <span className="text-xs font-medium uppercase tracking-wide text-primary/70">
              {recipe.category.name}
            </span>
          )}
          <h3 className="line-clamp-2 font-semibold leading-snug">{recipe.title}</h3>
          {recipe.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{recipe.description}</p>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" />
              {formatMinutes(totalTime(recipe.prep_time_minutes, recipe.cook_time_minutes))}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="size-3.5" />
              {recipe.servings}
            </span>
            {recipe.view_count > 0 && (
              <span className="inline-flex items-center gap-1">
                <Eye className="size-3.5" />
                {recipe.view_count}
              </span>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
}
