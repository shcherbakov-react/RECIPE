"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { dictionariesApi, recipesApi } from "@/lib/api/endpoints";
import type {
  CreateRecipeInput,
  RecipeListFilter,
  UpdateRecipeInput,
} from "@/lib/api/types";

export const recipeKeys = {
  all: ["recipes"] as const,
  list: (scope: string, filter?: RecipeListFilter) =>
    ["recipes", scope, filter ?? {}] as const,
  detail: (id: string) => ["recipes", "detail", id] as const,
  search: (q: string) => ["recipes", "search", q] as const,
};

export function useRecipesList(filter?: RecipeListFilter) {
  return useQuery({
    queryKey: recipeKeys.list("public", filter),
    queryFn: () => recipesApi.list(filter),
  });
}

export function useMyRecipes(filter?: RecipeListFilter, enabled = true) {
  return useQuery({
    queryKey: recipeKeys.list("mine", filter),
    queryFn: () => recipesApi.listMine(filter),
    enabled,
  });
}

export function useFavorites(filter?: RecipeListFilter, enabled = true) {
  return useQuery({
    queryKey: recipeKeys.list("favorites", filter),
    queryFn: () => recipesApi.listFavorites(filter),
    enabled,
  });
}

export function useRecipe(id: string | null) {
  return useQuery({
    queryKey: recipeKeys.detail(id ?? ""),
    queryFn: () => recipesApi.get(id as string),
    enabled: !!id,
  });
}

export function useSearchRecipes(q: string, enabled = true) {
  return useQuery({
    queryKey: recipeKeys.search(q),
    queryFn: () => recipesApi.search(q, { limit: 30 }),
    enabled: enabled && q.trim().length > 0,
  });
}

export function useCategories(q?: string) {
  return useQuery({
    queryKey: ["categories", q ?? ""],
    queryFn: () => dictionariesApi.categories(q),
    staleTime: 5 * 60_000,
  });
}

export function useTags(q?: string) {
  return useQuery({
    queryKey: ["tags", q ?? ""],
    queryFn: () => dictionariesApi.tags(q),
    staleTime: 5 * 60_000,
  });
}

export function useCreateRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRecipeInput) => recipesApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: recipeKeys.all }),
  });
}

export function useUpdateRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRecipeInput }) =>
      recipesApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: recipeKeys.all }),
  });
}

export function useDeleteRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => recipesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: recipeKeys.all }),
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, favorite }: { id: string; favorite: boolean }) =>
      favorite ? recipesApi.removeFavorite(id) : recipesApi.addFavorite(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: recipeKeys.all }),
  });
}
