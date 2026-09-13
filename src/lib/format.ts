import type { Difficulty } from "@/lib/api/types";

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Легко",
  medium: "Средне",
  hard: "Сложно",
};

export const DIFFICULTY_BADGE: Record<Difficulty, string> = {
  easy: "border-transparent bg-emerald-100 text-emerald-700",
  medium: "border-transparent bg-amber-100 text-amber-700",
  hard: "border-transparent bg-rose-100 text-rose-700",
};

export const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "Легко" },
  { value: "medium", label: "Средне" },
  { value: "hard", label: "Сложно" },
];

export const MEAL_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "breakfast", label: "Завтрак" },
  { value: "lunch", label: "Обед" },
  { value: "dinner", label: "Ужин" },
  { value: "snack", label: "Перекус" },
  { value: "dessert", label: "Десерт" },
  { value: "drink", label: "Напиток" },
];

export function formatMinutes(total: number): string {
  if (!total || total <= 0) return "—";
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours && minutes) return `${hours} ч ${minutes} мин`;
  if (hours) return `${hours} ч`;
  return `${minutes} мин`;
}

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

export function formatServings(n: number): string {
  return `${n} ${plural(n, "порция", "порции", "порций")}`;
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function totalTime(prep: number, cook: number): number {
  return (prep || 0) + (cook || 0);
}
