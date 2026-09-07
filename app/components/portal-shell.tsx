import Link from "next/link";
import { DISCORD_URL } from "../data/portal";

function Mark() {
  return (
    <span className="portal-mark" aria-hidden="true">
      <i />
    </span>
  );
}

export function PortalBrand() {
  return (
    <Link className="portal-brand" href="/">
      <Mark />
      <span><b>SVFRAME</b><small>POKÉ PORTAL</small></span>
    </Link>
  );
}

export function DesktopPortalNav({ active }: { active?: "home" | "dex" | "play" }) {
  return (
    <aside className="portal-desktop-nav desktop-only">
      <PortalBrand />
      <nav aria-label="Điều hướng chính">
        <Link className={active === "home" ? "active" : ""} href="/"><span>01</span>Trang chủ</Link>
        <Link className={active === "dex" ? "active" : ""} href="/wiki"><span>02</span>World Dex</Link>
        <Link className={active === "play" ? "active" : ""} href="/play"><span>03</span>Tải Launcher</Link>
        <a href={DISCORD_URL} target="_blank" rel="noreferrer"><span>04</span>Discord</a>
      </nav>
      <div className="portal-nav-foot">
        <small>Minecraft 1.21.1</small>
        <strong>Cobblemon 1.8</strong>
      </div>
    </aside>
  );
}

export function MobilePortalHeader({ title }: { title: string }) {
  return (
    <header className="portal-mobile-header mobile-only">
      <PortalBrand />
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
      <a href={DISCORD_URL} target="_blank" rel="noreferrer"><i>◈</i><span>Discord</span></a>
    </nav>
  );
}
