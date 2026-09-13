// Типы, соответствующие доменным моделям бэкенда (recipe-backend/internal/domain)

export type Difficulty = "easy" | "medium" | "hard";

export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface User {
  id: string;
  email: string | null;
  username: string;
  avatar_url: string | null;
  is_email_verified: boolean;
  is_active: boolean;
  provider: string;
  created_at: string;
  updated_at: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

export interface AuthResponse {
  user: User;
  tokens: TokenPair;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface RecipeIngredient {
  name: string;
  amount?: string | null;
  unit?: string | null;
  notes?: string | null;
  position: number;
}

export interface RecipeStep {
  text: string;
  position: number;
}

export interface Recipe {
  id: string;
  author_id: string;
  category_id: string;
  title: string;
  description: string;
  image_url: string | null;
  servings: number;
  prep_time_minutes: number;
  cook_time_minutes: number;
  difficulty: Difficulty;
  cuisine: string | null;
  meal_type: string | null;
  ingredients: RecipeIngredient[];
  instructions: RecipeStep[];
  source_url: string | null;
  is_public: boolean;
  view_count: number;
  is_favorite?: boolean;
  category?: Category | null;
  tags: Tag[];
  created_at: string;
  updated_at: string;
}

export interface RecipeListResponse {
  items: Recipe[];
  limit: number;
  offset: number;
  total: number;
}

export interface RecipeCategorySuggestion {
  category: Category | null;
  top_recipes: Recipe[] | null;
}

export interface RecipeSearchResponse {
  query: string;
  sections: RecipeCategorySuggestion[] | null;
  recipes: RecipeListResponse | null;
}

export interface RecipeListFilter {
  q?: string;
  category_id?: string;
  category?: string;
  cuisine?: string;
  meal_type?: string;
  difficulty?: Difficulty | "";
  tag?: string[];
  tags?: string;
  limit?: number;
  offset?: number;
}

export interface CreateRecipeInput {
  category_id: string;
  title: string;
  description?: string;
  image_url?: string | null;
  servings: number;
  prep_time_minutes: number;
  cook_time_minutes: number;
  difficulty: Difficulty;
  cuisine?: string | null;
  meal_type?: string | null;
  ingredients: RecipeIngredient[];
  instructions: RecipeStep[];
  source_url?: string | null;
  is_public?: boolean;
  tag_ids?: string[];
}

export type UpdateRecipeInput = Partial<CreateRecipeInput>;

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
