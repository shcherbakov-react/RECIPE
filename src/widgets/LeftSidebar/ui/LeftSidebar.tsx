"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";
import { PRIMARY_NAV, USER_NAV, type NavItem } from "./nav-items";

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
      )}
    >
      <Icon className="size-4.5 shrink-0" />
      {item.label}
    </Link>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="flex flex-col gap-1">
      {PRIMARY_NAV.map((item) => (
        <NavLink key={item.href} item={item} active={isActive(item.href)} onNavigate={onNavigate} />
      ))}

      {isAuthenticated && (
        <>
          <div className="my-2 px-3 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/40">
            Личное
          </div>
          {USER_NAV.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActive(item.href)}
              onNavigate={onNavigate}
            />
          ))}
        </>
      )}
    </nav>
  );
}

export function SidebarBrand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      className="flex items-center gap-2 px-3 py-1 text-lg font-bold tracking-tight"
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[color-mix(in_oklch,var(--primary),#e85d2a_60%)] text-primary-foreground shadow-sm">
        <ChefHat className="size-5" />
      </span>
      <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">Рецептор</span>
    </Link>
  );
}

export function LeftSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 border-r border-sidebar-border bg-sidebar/80 px-3 py-5 backdrop-blur lg:flex">
      <SidebarBrand />
      <SidebarNav />
    </aside>
  );
}
