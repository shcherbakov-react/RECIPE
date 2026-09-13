import {
  Home,
  Search,
  Shuffle,
  BookMarked,
  Heart,
  PlusCircle,
  User,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  auth?: boolean;
}

export const PRIMARY_NAV: NavItem[] = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/search", label: "Поиск", icon: Search },
  { href: "/random", label: "Случайный", icon: Shuffle },
];

export const USER_NAV: NavItem[] = [
  { href: "/my", label: "Мои рецепты", icon: BookMarked, auth: true },
  { href: "/favorites", label: "Избранное", icon: Heart, auth: true },
  { href: "/create", label: "Добавить рецепт", icon: PlusCircle, auth: true },
  { href: "/profile", label: "Профиль", icon: User, auth: true },
];
