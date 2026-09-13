"use client";

import { X } from "lucide-react";
import type { Difficulty, RecipeListFilter } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useCategories, useTags } from "@/lib/hooks/use-recipes";
import { DIFFICULTY_OPTIONS, MEAL_TYPE_OPTIONS } from "@/lib/format";
import { cn } from "@/lib/utils";

const ALL = "__all__";

export function Filters({
  value,
  onChange,
  showMealType = true,
  showTags = true,
}: {
  value: RecipeListFilter;
  onChange: (next: RecipeListFilter) => void;
  showMealType?: boolean;
  showTags?: boolean;
}) {
  const { data: categories } = useCategories();
  const { data: tags } = useTags();

  const set = (patch: Partial<RecipeListFilter>) => onChange({ ...value, ...patch });

  const activeTags = value.tag ?? [];
  const toggleTag = (slug: string) => {
    const next = activeTags.includes(slug)
      ? activeTags.filter((t) => t !== slug)
      : [...activeTags, slug];
    set({ tag: next.length ? next : undefined });
  };

  const hasActive =
    !!value.category || !!value.difficulty || !!value.meal_type || activeTags.length > 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={value.category || ALL}
          items={{
            [ALL]: "Все категории",
            ...Object.fromEntries((categories ?? []).map((c) => [c.slug, c.name])),
          }}
          onValueChange={(v) => set({ category: v === ALL ? undefined : String(v) })}
        >
          <SelectTrigger className="w-auto min-w-44">
            <SelectValue placeholder="Категория" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Все категории</SelectItem>
            {categories?.map((c) => (
              <SelectItem key={c.id} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.difficulty || ALL}
          items={{
            [ALL]: "Любая сложность",
            ...Object.fromEntries(DIFFICULTY_OPTIONS.map((d) => [d.value, d.label])),
          }}
          onValueChange={(v) =>
            set({ difficulty: v === ALL ? undefined : (String(v) as Difficulty) })
          }
        >
          <SelectTrigger className="w-auto min-w-36">
            <SelectValue placeholder="Сложность" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Любая сложность</SelectItem>
            {DIFFICULTY_OPTIONS.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showMealType && (
          <Select
            value={value.meal_type || ALL}
            items={{
              [ALL]: "Любой тип",
              ...Object.fromEntries(MEAL_TYPE_OPTIONS.map((m) => [m.value, m.label])),
            }}
            onValueChange={(v) => set({ meal_type: v === ALL ? undefined : String(v) })}
          >
            <SelectTrigger className="w-auto min-w-36">
              <SelectValue placeholder="Тип блюда" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Любой тип</SelectItem>
              {MEAL_TYPE_OPTIONS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {hasActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onChange({
                ...value,
                category: undefined,
                difficulty: undefined,
                meal_type: undefined,
                tag: undefined,
              })
            }
          >
            <X className="size-4" />
            Сбросить
          </Button>
        )}
      </div>

      {showTags && !!tags?.length && (
        <div className="flex flex-wrap gap-1.5">
          {tags.slice(0, 24).map((t) => {
            const active = activeTags.includes(t.slug);
            return (
              <button key={t.id} type="button" onClick={() => toggleTag(t.slug)}>
                <Badge
                  variant={active ? "default" : "outline"}
                  className={cn("cursor-pointer transition-colors", !active && "hover:bg-muted")}
                >
                  {t.name}
                </Badge>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
