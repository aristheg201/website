import type { Metadata } from "next";
import "./globals.css";
import "./svframe.css";
import "./portal.css";

export const metadata: Metadata = {
  title: "SVFrame Poké Portal",
  description: "World Dex, Fakemon spawn lookup, Bestiary Launcher và Discord của SVFrame Cobblemon.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
