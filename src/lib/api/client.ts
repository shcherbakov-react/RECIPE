import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import type { ApiEnvelope, TokenPair } from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") || "https://api.daloof.ru";

const ACCESS_KEY = "recipe.access_token";
const REFRESH_KEY = "recipe.refresh_token";

export const tokenStore = {
  get access() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACCESS_KEY);
  },
  get refresh() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(REFRESH_KEY);
  },
  set(tokens: TokenPair) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ACCESS_KEY, tokens.access_token);
    window.localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
    window.dispatchEvent(new Event("recipe:auth-changed"));
  },
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
    window.dispatchEvent(new Event("recipe:auth-changed"));
  },
};

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.access;
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function refreshTokens(): Promise<string | null> {
  const refresh = tokenStore.refresh;
  if (!refresh) return null;
  try {
    const res = await axios.post<ApiEnvelope<TokenPair>>(
      `${BASE_URL}/api/v1/auth/refresh`,
      { refresh_token: refresh },
      { headers: { "Content-Type": "application/json" } }
    );
    const tokens = res.data.data;
    if (tokens?.access_token) {
      tokenStore.set(tokens);
      return tokens.access_token;
    }
    return null;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const status = error.response?.status;
    const isRefreshCall = original?.url?.includes("/auth/refresh");

    if (status === 401 && original && !original._retry && !isRefreshCall && tokenStore.refresh) {
      original._retry = true;
      if (!refreshing) {
        refreshing = refreshTokens().finally(() => {
          refreshing = null;
        });
      }
      const newToken = await refreshing;
      if (newToken) {
        original.headers.set("Authorization", `Bearer ${newToken}`);
        return api(original);
      }
      tokenStore.clear();
    }

    return Promise.reject(error);
  }
);

/** Достаёт data из конверта { success, data } или бросает понятную ошибку. */
export function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.error?.message || "Неизвестная ошибка");
  }
  return envelope.data;
}

export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.get<ApiEnvelope<T>>(url, config);
  return unwrap(res.data);
}

export async function apiPost<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.post<ApiEnvelope<T>>(url, body, config);
  return unwrap(res.data);
}

export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
  const res = await api.put<ApiEnvelope<T>>(url, body);
  return unwrap(res.data);
}

export async function apiDelete<T>(url: string): Promise<T> {
  const res = await api.delete<ApiEnvelope<T>>(url);
  return unwrap(res.data);
}

export function apiErrorMessage(error: unknown, fallback = "Что-то пошло не так"): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiEnvelope<unknown> | undefined;
    if (data?.error?.message) return data.error.message;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export { BASE_URL };
