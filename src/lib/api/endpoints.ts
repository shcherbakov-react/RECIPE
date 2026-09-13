import { apiDelete, apiGet, apiPost, apiPut } from "./client";
import type {
  AuthResponse,
  Category,
  CreateRecipeInput,
  LoginInput,
  Recipe,
  RecipeListFilter,
  RecipeListResponse,
  RecipeSearchResponse,
  RegisterInput,
  Tag,
  TokenPair,
  UpdateRecipeInput,
  User,
} from "./types";

function buildQuery(filter?: RecipeListFilter): string {
  if (!filter) return "";
  const params = new URLSearchParams();
  if (filter.q) params.set("q", filter.q);
  if (filter.category_id) params.set("category_id", filter.category_id);
  if (filter.category) params.set("category", filter.category);
  if (filter.cuisine) params.set("cuisine", filter.cuisine);
  if (filter.meal_type) params.set("meal_type", filter.meal_type);
  if (filter.difficulty) params.set("difficulty", filter.difficulty);
  if (filter.tags) params.set("tags", filter.tags);
  if (filter.tag) filter.tag.forEach((t) => params.append("tag", t));
  if (typeof filter.limit === "number") params.set("limit", String(filter.limit));
  if (typeof filter.offset === "number") params.set("offset", String(filter.offset));
  const str = params.toString();
  return str ? `?${str}` : "";
}

// ---------- Auth ----------
export const authApi = {
  register: (input: RegisterInput) => apiPost<AuthResponse>("/api/v1/auth/register", input),
  login: (input: LoginInput) => apiPost<AuthResponse>("/api/v1/auth/login", input),
  logout: (refresh_token: string) =>
    apiPost<{ message: string }>("/api/v1/auth/logout", { refresh_token }),
  refresh: (refresh_token: string) =>
    apiPost<TokenPair>("/api/v1/auth/refresh", { refresh_token }),
  me: () => apiGet<User>("/api/v1/auth/me"),
  updateMe: (updates: Partial<Pick<User, "username" | "avatar_url">>) =>
    apiPut<User>("/api/v1/auth/me", updates),
  changePassword: (old_password: string, new_password: string) =>
    apiPost<{ message: string }>("/api/v1/auth/change-password", {
      old_password,
      new_password,
    }),
  forgotPassword: (email: string) =>
    apiPost<{ message: string }>("/api/v1/auth/forgot-password", { email }),
};

// ---------- Recipes ----------
export const recipesApi = {
  list: (filter?: RecipeListFilter) =>
    apiGet<RecipeListResponse>(`/api/v1/recipes${buildQuery(filter)}`),
  listMine: (filter?: RecipeListFilter) =>
    apiGet<RecipeListResponse>(`/api/v1/recipes/my${buildQuery(filter)}`),
  listAvailable: (filter?: RecipeListFilter) =>
    apiGet<RecipeListResponse>(`/api/v1/recipes/available${buildQuery(filter)}`),
  listFavorites: (filter?: RecipeListFilter) =>
    apiGet<RecipeListResponse>(`/api/v1/recipes/favorites${buildQuery(filter)}`),
  search: (q: string, filter?: RecipeListFilter) =>
    apiGet<RecipeSearchResponse>(
      `/api/v1/recipes/search${buildQuery({ ...filter, q })}`
    ),
  get: (id: string) => apiGet<Recipe>(`/api/v1/recipes/${id}`),
  create: (input: CreateRecipeInput) => apiPost<Recipe>("/api/v1/recipes", input),
  update: (id: string, input: UpdateRecipeInput) =>
    apiPut<Recipe>(`/api/v1/recipes/${id}`, input),
  remove: (id: string) => apiDelete<{ message: string }>(`/api/v1/recipes/${id}`),
  addFavorite: (id: string) =>
    apiPost<{ message: string }>(`/api/v1/recipes/${id}/favorite`),
  removeFavorite: (id: string) =>
    apiDelete<{ message: string }>(`/api/v1/recipes/${id}/favorite`),
  random: (filter?: RecipeListFilter) =>
    apiGet<Recipe>(`/api/v1/recipes/random${buildQuery(filter)}`),
};

// ---------- Dictionaries ----------
export const dictionariesApi = {
  categories: (q?: string, limit = 100) =>
    apiGet<Category[]>(
      `/api/v1/categories?${new URLSearchParams({ q: q ?? "", limit: String(limit) })}`
    ),
  tags: (q?: string, limit = 100) =>
    apiGet<Tag[]>(
      `/api/v1/tags?${new URLSearchParams({ q: q ?? "", limit: String(limit) })}`
    ),
};
