"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChefHat } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { apiErrorMessage } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { OAuthButtons } from "@/components/common/oauth-buttons";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Пароль должен быть не короче 8 символов");
      return;
    }
    setLoading(true);
    try {
      await register({ email, username, password });
      toast.success("Аккаунт создан");
      router.push("/");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Не удалось зарегистрироваться"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <ChefHat className="size-6" />
          </span>
          <h1 className="text-2xl font-bold">Создать аккаунт</h1>
          <p className="text-sm text-muted-foreground">
            Сохраняйте любимые рецепты и добавляйте свои
          </p>
        </div>
        <Card>
          <CardContent>
            <form onSubmit={submit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="username">Имя пользователя</Label>
                <Input
                  id="username"
                  required
                  minLength={3}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="chef_ivan"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Минимум 8 символов"
                />
              </div>
              <Button type="submit" disabled={loading} className="mt-2">
                {loading ? "Создание…" : "Зарегистрироваться"}
              </Button>
            </form>
            <div className="mt-5">
              <OAuthButtons />
            </div>
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
