import type { Metadata } from "next";
import "./globals-core.css";
import "./globals-wiki-responsive.css";
import "./svframe.css";
export const metadata:Metadata={title:"SVFrame Network — Cobblemon Shop & Wiki",description:"Shop skin Pokémon, Hunter Coin, gói đổi FTB Quests và Wiki spawn của SVFrame Network."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="vi"><body>{children}</body></html>}
