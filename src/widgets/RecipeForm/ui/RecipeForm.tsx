"use client";

import { useMemo, useRef, useState } from "react";
import { ImagePlus, Plus, Trash2, X } from "lucide-react";
import type {
  CreateRecipeInput,
  Difficulty,
  Recipe,
  RecipeIngredient,
  RecipeStep,
} from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useCategories, useTags } from "@/lib/hooks/use-recipes";
import { uploadsApi } from "@/lib/api/endpoints";
import { apiErrorMessage } from "@/lib/api/client";
import { DIFFICULTY_OPTIONS, MEAL_TYPE_OPTIONS } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface RecipeFormValues {
  title: string;
  description: string;
  image_url: string;
  category_id: string;
  servings: number;
  prep_time_minutes: number;
  cook_time_minutes: number;
  difficulty: Difficulty;
  cuisine: string;
  meal_type: string;
  is_public: boolean;
  ingredients: RecipeIngredient[];
  instructions: RecipeStep[];
  tag_ids: string[];
}

const NONE = "__none__";

export function emptyRecipeValues(): RecipeFormValues {
  return {
    title: "",
    description: "",
    image_url: "",
    category_id: "",
    servings: 2,
    prep_time_minutes: 10,
    cook_time_minutes: 30,
    difficulty: "easy",
    cuisine: "",
    meal_type: "",
    is_public: true,
    ingredients: [{ name: "", amount: "", unit: "", position: 0 }],
    instructions: [{ text: "", position: 0 }],
    tag_ids: [],
  };
}

export function recipeToValues(recipe: Recipe): RecipeFormValues {
  return {
    title: recipe.title,
    description: recipe.description ?? "",
    image_url: recipe.image_url ?? "",
    category_id: recipe.category_id ?? "",
    servings: recipe.servings,
    prep_time_minutes: recipe.prep_time_minutes,
    cook_time_minutes: recipe.cook_time_minutes,
    difficulty: recipe.difficulty,
    cuisine: recipe.cuisine ?? "",
    meal_type: recipe.meal_type ?? "",
    is_public: recipe.is_public,
    ingredients: recipe.ingredients?.length
      ? recipe.ingredients.map((i, idx) => ({
          name: i.name,
          amount: i.amount ?? "",
          unit: i.unit ?? "",
          notes: i.notes ?? "",
          position: idx,
        }))
      : [{ name: "", amount: "", unit: "", position: 0 }],
    instructions: recipe.instructions?.length
      ? recipe.instructions.map((s, idx) => ({ text: s.text, position: idx }))
      : [{ text: "", position: 0 }],
    tag_ids: recipe.tags?.map((t) => t.id) ?? [],
  };
}

export function valuesToInput(v: RecipeFormValues): CreateRecipeInput {
  const clean = (s: string) => {
    const t = s.trim();
    return t ? t : null;
  };
  return {
    title: v.title.trim(),
    description: v.description.trim(),
    image_url: clean(v.image_url),
    category_id: v.category_id,
    servings: Number(v.servings),
    prep_time_minutes: Number(v.prep_time_minutes),
    cook_time_minutes: Number(v.cook_time_minutes),
    difficulty: v.difficulty,
    cuisine: clean(v.cuisine),
    meal_type: v.meal_type ? v.meal_type : null,
    is_public: v.is_public,
    ingredients: v.ingredients
      .filter((i) => i.name.trim())
      .map((i, idx) => ({
        name: i.name.trim(),
        amount: i.amount?.trim() || null,
        unit: i.unit?.trim() || null,
        notes: i.notes?.trim() || null,
        position: idx,
      })),
    instructions: v.instructions
      .filter((s) => s.text.trim())
      .map((s, idx) => ({ text: s.text.trim(), position: idx })),
    tag_ids: v.tag_ids,
  };
}

export function validate(v: RecipeFormValues): string | null {
  if (v.title.trim().length < 2) return "Введите название рецепта (минимум 2 символа).";
  if (!v.category_id) return "Выберите категорию.";
  if (v.servings < 1) return "Количество порций должно быть не меньше 1.";
  if (v.cook_time_minutes < 1) return "Укажите время приготовления.";
  if (!v.ingredients.some((i) => i.name.trim())) return "Добавьте хотя бы один ингредиент.";
  if (!v.instructions.some((s) => s.text.trim())) return "Добавьте хотя бы один шаг.";
  return null;
}

export function RecipeForm({
  values,
  onChange,
  onSubmit,
  submitting,
  submitLabel = "Сохранить",
}: {
  values: RecipeFormValues;
  onChange: (v: RecipeFormValues) => void;
  onSubmit: () => void;
  submitting?: boolean;
  submitLabel?: string;
}) {
  const { data: categories } = useCategories();
  const { data: tags } = useTags();
  const [error, setError] = useState<string | null>(null);

  const set = (patch: Partial<RecipeFormValues>) => onChange({ ...values, ...patch });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onPickFile = async (file?: File) => {
    if (!file) return;
    setUploadError(null);
    if (!file.type.startsWith("image/")) {
      setUploadError("Можно загрузить только изображение.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Файл слишком большой (максимум 5 МБ).");
      return;
    }
    setUploading(true);
    try {
      const { url } = await uploadsApi.image(file);
      set({ image_url: url });
    } catch (err) {
      setUploadError(apiErrorMessage(err, "Не удалось загрузить фото."));
    } finally {
      setUploading(false);
    }
  };

  const selectedTagIds = useMemo(() => new Set(values.tag_ids), [values.tag_ids]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate(values);
    setError(err);
    if (!err) onSubmit();
  };

  // ---- ingredients ----
  const updateIngredient = (idx: number, patch: Partial<RecipeIngredient>) => {
    const next = values.ingredients.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    set({ ingredients: next });
  };
  const addIngredient = () =>
    set({
      ingredients: [
        ...values.ingredients,
        { name: "", amount: "", unit: "", position: values.ingredients.length },
      ],
    });
  const removeIngredient = (idx: number) =>
    set({ ingredients: values.ingredients.filter((_, i) => i !== idx) });

  // ---- steps ----
  const updateStep = (idx: number, text: string) => {
    const next = values.instructions.map((s, i) => (i === idx ? { ...s, text } : s));
    set({ instructions: next });
  };
  const addStep = () =>
    set({ instructions: [...values.instructions, { text: "", position: values.instructions.length }] });
  const removeStep = (idx: number) =>
    set({ instructions: values.instructions.filter((_, i) => i !== idx) });

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Название</Label>
            <Input
              id="title"
              value={values.title}
              onChange={(e) => set({ title: e.target.value })}
              placeholder="Например, Паста карбонара"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={values.description}
              onChange={(e) => set({ description: e.target.value })}
              placeholder="Короткое описание блюда"
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Фото рецепта</Label>
            {values.image_url ? (
              <div className="relative w-full overflow-hidden rounded-lg border">
                <img
                  src={values.image_url}
                  alt="Превью"
                  className="max-h-64 w-full object-cover"
                />
                <div className="absolute right-2 top-2 flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? "Загрузка…" : "Заменить"}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => set({ image_url: "" })}
                    disabled={uploading}
                    aria-label="Убрать фото"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-sm text-muted-foreground transition hover:bg-muted disabled:opacity-60"
              >
                <ImagePlus className="size-6" />
                {uploading ? "Загрузка…" : "Загрузить фото"}
                <span className="text-xs">JPEG, PNG, WebP или GIF, до 5 МБ</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                void onPickFile(f);
              }}
            />
            {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>Категория</Label>
              <Select
                value={values.category_id || undefined}
                items={Object.fromEntries((categories ?? []).map((c) => [c.id, c.name]))}
                onValueChange={(v) => set({ category_id: String(v) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Сложность</Label>
              <Select
                value={values.difficulty}
                items={Object.fromEntries(DIFFICULTY_OPTIONS.map((d) => [d.value, d.label]))}
                onValueChange={(v) => set({ difficulty: String(v) as Difficulty })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_OPTIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="servings">Порции</Label>
              <Input
                id="servings"
                type="number"
                min={1}
                value={values.servings}
                onChange={(e) => set({ servings: Number(e.target.value) })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="prep">Подготовка, мин</Label>
              <Input
                id="prep"
                type="number"
                min={0}
                value={values.prep_time_minutes}
                onChange={(e) => set({ prep_time_minutes: Number(e.target.value) })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cook">Готовка, мин</Label>
              <Input
                id="cook"
                type="number"
                min={1}
                value={values.cook_time_minutes}
                onChange={(e) => set({ cook_time_minutes: Number(e.target.value) })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Тип блюда</Label>
              <Select
                value={values.meal_type || NONE}
                items={{
                  [NONE]: "Не указан",
                  ...Object.fromEntries(MEAL_TYPE_OPTIONS.map((m) => [m.value, m.label])),
                }}
                onValueChange={(v) => set({ meal_type: v === NONE ? "" : String(v) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Не указан</SelectItem>
                  {MEAL_TYPE_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="cuisine">Кухня</Label>
            <Input
              id="cuisine"
              value={values.cuisine}
              onChange={(e) => set({ cuisine: e.target.value })}
              placeholder="Например, Итальянская"
            />
          </div>

          <label className="flex items-center justify-between rounded-lg border p-3">
            <span className="flex flex-col">
              <span className="text-sm font-medium">Публичный рецепт</span>
              <span className="text-xs text-muted-foreground">
                Виден всем пользователям в общей ленте
              </span>
            </span>
            <Switch
              checked={values.is_public}
              onCheckedChange={(checked) => set({ is_public: checked })}
            />
          </label>
        </CardContent>
      </Card>

      {/* Ингредиенты */}
      <Card>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Ингредиенты</h2>
            <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
              <Plus className="size-4" />
              Добавить
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {values.ingredients.map((ing, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={ing.name}
                  onChange={(e) => updateIngredient(idx, { name: e.target.value })}
                  placeholder="Ингредиент"
                  className="flex-[2]"
                />
                <Input
                  value={ing.amount ?? ""}
                  onChange={(e) => updateIngredient(idx, { amount: e.target.value })}
                  placeholder="Кол-во"
                  className="flex-1"
                />
                <Input
                  value={ing.unit ?? ""}
                  onChange={(e) => updateIngredient(idx, { unit: e.target.value })}
                  placeholder="Ед."
                  className="w-20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeIngredient(idx)}
                  disabled={values.ingredients.length === 1}
                  aria-label="Удалить"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Шаги */}
      <Card>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Приготовление</h2>
            <Button type="button" variant="outline" size="sm" onClick={addStep}>
              <Plus className="size-4" />
              Добавить шаг
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            {values.instructions.map((step, idx) => (
              <div key={idx} className="flex gap-2">
                <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                  {idx + 1}
                </div>
                <Textarea
                  value={step.text}
                  onChange={(e) => updateStep(idx, e.target.value)}
                  placeholder={`Шаг ${idx + 1}`}
                  rows={2}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeStep(idx)}
                  disabled={values.instructions.length === 1}
                  aria-label="Удалить шаг"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Теги */}
      {!!tags?.length && (
        <Card>
          <CardContent className="flex flex-col gap-3">
            <h2 className="font-semibold">Теги</h2>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => {
                const active = selectedTagIds.has(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() =>
                      set({
                        tag_ids: active
                          ? values.tag_ids.filter((id) => id !== t.id)
                          : [...values.tag_ids, t.id],
                      })
                    }
                  >
                    <Badge
                      variant={active ? "default" : "outline"}
                      className={cn("cursor-pointer", !active && "hover:bg-muted")}
                    >
                      {t.name}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "Сохранение…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
