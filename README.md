# Рецептор — фронтенд

Веб-приложение сервиса рецептов: просмотр публичных рецептов, поиск и фильтры,
избранное, создание и редактирование собственных рецептов, авторизация.

Стек: **Next.js 16 (App Router, статический экспорт)**, **React 19**, **TypeScript**,
**Tailwind CSS v4**, **shadcn/ui** (стиль base-nova на примитивах Base UI),
**TanStack Query**, **axios**.

## Требования

- Node.js 20+ (проверено на Node 22)
- Запущенный бэкенд (`recipes-backend`)

## Переменные окружения

Адрес API задаётся переменной `NEXT_PUBLIC_BASE_PATH` (файлы `.env`, `.env.production`):

```
NEXT_PUBLIC_BASE_PATH=https://api.daloof.ru
```

Для локальной разработки против локального бэкенда укажите `http://localhost:8080`.
Бэкенд уже разрешает CORS для `http://localhost:3000` и `http://localhost:5173`.

## Запуск

```bash
npm install
npm run dev        # http://localhost:3000
```

## Сборка

```bash
npm run build      # статический экспорт в ./dist
```

Готовый `./dist` раздаётся как SPA (см. `nginx.conf` и `Dockerfile`): все
неизвестные пути отдают `index.html`, поэтому глубокие ссылки работают.
Динамические данные (рецепт, редактирование) передаются через query-параметры
(`/recipe?id=…`, `/edit?id=…`), что совместимо со статическим экспортом.

## Структура

```
src/
  app/                 маршруты (главная, /login, /register, /recipe, /create,
                       /edit, /my, /favorites, /search, /random, /profile,
                       /auth/callback)
  components/ui/       shadcn-компоненты (button, card, input, select, dialog, …)
  components/common/   вспомогательные (spinner, empty-state, require-auth, …)
  lib/api/             axios-клиент, типы, эндпоинты
  lib/auth/            контекст авторизации (JWT + авто-refresh)
  lib/hooks/           хуки TanStack Query
  widgets/             AppShell, LeftSidebar, Topbar, RecipeCard, RecipeForm, Filters
```

## Возможности

- Регистрация и вход (JWT, автоматическое обновление access-токена по refresh)
- Лента публичных рецептов с фильтрами (категория, сложность, тип блюда, теги)
- Поиск, случайный рецепт
- Страница рецепта: ингредиенты, шаги, метаданные, добавление в избранное
- Создание и редактирование рецептов (динамические ингредиенты и шаги, теги)
- Разделы «Мои рецепты», «Избранное», «Профиль» (смена пароля, данные)
