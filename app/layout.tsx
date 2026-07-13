import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hunter Network Shop — Skin, Hunter Coin & Thẻ Server",
  description: "Shop Hunter Network: skin Pokémon, Hunter Coin, thẻ server, bộ mod Cobblemon, hướng dẫn cài đặt và Wiki spawn theo biome.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/website/art/hunter-coin.png",
    shortcut: "/website/art/hunter-coin.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
