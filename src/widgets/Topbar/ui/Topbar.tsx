"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, LogOut, User as UserIcon, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth/auth-context";
import { SidebarNav, SidebarBrand } from "@/widgets/LeftSidebar";

function initialsOf(name: string) {
  return name.trim().slice(0, 2).toUpperCase() || "?";
}

export function Topbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState("");

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const value = q.trim();
    router.push(value ? `/search?q=${encodeURIComponent(value)}` : "/search");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMenuOpen(true)}
        aria-label="Меню"
      >
        <Menu className="size-5" />
      </Button>

      <form onSubmit={submitSearch} className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск рецептов…"
          className="h-9 rounded-full bg-muted/60 pl-9"
        />
      </form>

      <div className="ml-auto flex items-center gap-2">
        {isAuthenticated && user ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
              render={<Link href="/create" />}
            >
              <PlusCircle className="size-4" />
              Добавить
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50" />
                }
              >
                <Avatar>
                  {user.avatar_url && <AvatarImage src={user.avatar_url} alt={user.username} />}
                  <AvatarFallback>{initialsOf(user.username)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.username}</span>
                    {user.email && (
                      <span className="text-xs font-normal text-muted-foreground">
                        {user.email}
                      </span>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/profile" />}>
                  <UserIcon />
                  Профиль
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
                >
                  <LogOut />
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" render={<Link href="/login" />}>
              Войти
            </Button>
            <Button size="sm" render={<Link href="/register" />}>
              Регистрация
            </Button>
          </>
        )}
      </div>

      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent
          showClose
          className="left-0 top-0 h-full max-w-72 -translate-x-0 -translate-y-0 rounded-none rounded-r-2xl"
        >
          <DialogTitle className="sr-only">Навигация</DialogTitle>
          <div className="flex flex-col gap-6">
            <SidebarBrand onNavigate={() => setMenuOpen(false)} />
            <SidebarNav onNavigate={() => setMenuOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
