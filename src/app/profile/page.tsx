"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { authApi } from "@/lib/api/endpoints";
import { apiErrorMessage } from "@/lib/api/client";
import { RequireAuth } from "@/components/common/require-auth";
import { PageContainer, PageHeader } from "@/components/common/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

function ProfileInner() {
  const { user, setUser, refreshUser } = useAuth();
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setAvatarUrl(user.avatar_url ?? "");
    }
  }, [user]);

  if (!user) return null;

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await authApi.updateMe({
        username: username.trim(),
        avatar_url: avatarUrl.trim() || null,
      });
      setUser(updated);
      toast.success("Профиль обновлён");
    } catch (err) {
      toast.error(apiErrorMessage(err));
      refreshUser();
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Новый пароль должен быть не короче 8 символов");
      return;
    }
    setSavingPassword(true);
    try {
      await authApi.changePassword(oldPassword, newPassword);
      toast.success("Пароль изменён");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <PageContainer className="max-w-2xl">
      <PageHeader title="Профиль" />

      <div className="flex flex-col gap-6">
        <Card>
          <CardContent className="flex items-center gap-4">
            <Avatar className="size-16">
              {user.avatar_url && <AvatarImage src={user.avatar_url} alt={user.username} />}
              <AvatarFallback className="text-lg">
                {user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">{user.username}</span>
                {user.is_email_verified ? (
                  <Badge variant="muted">
                    <BadgeCheck className="size-3" /> Подтверждён
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <ShieldAlert className="size-3" /> Не подтверждён
                  </Badge>
                )}
              </div>
              {user.email && <span className="text-sm text-muted-foreground">{user.email}</span>}
              <span className="text-xs text-muted-foreground">Вход через: {user.provider}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Данные профиля</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveProfile} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="username">Имя пользователя</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  minLength={3}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="avatar">Ссылка на аватар</Label>
                <Input
                  id="avatar"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://…"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={savingProfile}>
                  {savingProfile ? "Сохранение…" : "Сохранить"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {user.provider === "email" && (
          <Card>
            <CardHeader>
              <CardTitle>Смена пароля</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={changePassword} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="old">Текущий пароль</Label>
                  <Input
                    id="old"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="new">Новый пароль</Label>
                  <Input
                    id="new"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="outline" disabled={savingPassword}>
                    {savingPassword ? "Сохранение…" : "Изменить пароль"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileInner />
    </RequireAuth>
  );
}
