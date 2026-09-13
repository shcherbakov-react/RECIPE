import { Metadata } from "next";

import "./styles/main.css";
import "./styles/variables.css";
import s from "./styles.module.css";
import { Providers } from "@/lib/providers";
import { AppShell } from "@/widgets/AppShell/ui/AppShell";

export const metadata: Metadata = {
  title: "Рецептор — коллекция рецептов",
  description: "Находите, сохраняйте и создавайте кулинарные рецепты.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="font-sans">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <Providers>
          <div className={s.root} id="root">
            <AppShell>{children}</AppShell>
          </div>
        </Providers>
      </body>
    </html>
  );
}
