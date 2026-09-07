import Link from "next/link";
import { DISCORD_URL } from "../data/portal";

const LOGO = `${process.env.NEXT_PUBLIC_BASE_PATH ?? "/website"}/brand/bestiary-logo.webp`;

export function PortalBrand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className={`portal-brand ${compact ? "compact" : ""}`} href="/" aria-label="Bestiary Beast home">
      <img src={LOGO} alt="Bestiary Beast" />
    </Link>
  );
}

export function DesktopPortalNav({ active }: { active?: "home" | "dex" | "play" }) {
  return (
    <aside className="portal-desktop-nav desktop-only">
      <PortalBrand />
      <nav aria-label="Điều hướng chính">
        <Link className={active === "home" ? "active" : ""} href="/"><b>⌂</b><span>Trang chủ</span></Link>
        <Link className={active === "dex" ? "active" : ""} href="/wiki"><b>⌕</b><span>World Dex</span></Link>
        <Link className={active === "play" ? "active" : ""} href="/play"><b>↓</b><span>Launcher</span></Link>
        <a href={DISCORD_URL} target="_blank" rel="noreferrer"><b>◆</b><span>Discord</span></a>
      </nav>
      <div className="portal-nav-foot">
        <span className="status-dot" />
        <div><small>SVFRAME NETWORK</small><strong>MC 1.21.1 · Cobblemon 1.8</strong></div>
      </div>
    </aside>
  );
}

export function MobilePortalHeader({ title }: { title: string }) {
  return (
    <header className="portal-mobile-header mobile-only">
      <PortalBrand compact />
      <span>{title}</span>
    </header>
  );
}

export function MobilePortalNav({ active }: { active?: "home" | "dex" | "play" }) {
  return (
    <nav className="portal-mobile-nav mobile-only" aria-label="Điều hướng di động">
      <Link className={active === "home" ? "active" : ""} href="/"><i>⌂</i><span>Home</span></Link>
      <Link className={active === "dex" ? "active" : ""} href="/wiki"><i>⌕</i><span>Dex</span></Link>
      <Link className={`mobile-play-button ${active === "play" ? "active" : ""}`} href="/play"><i>↓</i><span>Play</span></Link>
      <a href={DISCORD_URL} target="_blank" rel="noreferrer"><i>◆</i><span>Discord</span></a>
    </nav>
  );
}
