import Link from "next/link";
import { DesktopPortalNav, MobilePortalHeader, MobilePortalNav } from "./portal-shell";
import { DISCORD_URL, LAUNCHER_VERSION } from "../data/portal";

const LOGO = `${process.env.NEXT_PUBLIC_BASE_PATH ?? "/website"}/brand/bestiary-logo.webp`;

function DesktopHome() {
  return (
    <div className="portal-desktop desktop-only">
      <DesktopPortalNav active="home" />
      <main className="portal-main home-main">
        <section className="home-hero-redesign">
          <div className="hero-copy">
            <div className="portal-eyebrow">SVFRAME COBBLEMON · BESTIARY BEAST</div>
            <h1>Khám phá server.<br/><span>Không cần mò.</span></h1>
            <p>Tra spawn Pokémon và Fakemon, xem biome/condition, tải launcher và vào Discord — tất cả gom đúng chỗ, không lặp thông tin.</p>
            <div className="portal-actions">
              <Link className="portal-primary" href="/wiki">Mở World Dex <span>→</span></Link>
              <Link className="portal-secondary" href="/play">Tải Launcher</Link>
            </div>
            <div className="hero-mini-stats">
              <span><b>1.21.1</b><small>Minecraft</small></span>
              <span><b>1.8</b><small>Cobblemon</small></span>
              <span><b>Pokémon + Fakemon</b><small>Server Dex</small></span>
            </div>
          </div>
          <div className="hero-brand-panel">
            <div className="hero-logo-glow" />
            <img src={LOGO} alt="Bestiary Beast" />
            <div className="hero-brand-caption"><span className="status-dot"/><b>SVFrame Network</b><small>Poké Portal</small></div>
          </div>
        </section>

        <section className="home-action-row">
          <Link className="home-action primary-action" href="/wiki">
            <span className="action-icon">⌕</span>
            <div><small>TRA CỨU</small><strong>World Dex</strong><p>Biome · time · rarity · herd · alpha</p></div>
            <b>→</b>
          </Link>
          <Link className="home-action" href="/play">
            <span className="action-icon">↓</span>
            <div><small>CLIENT</small><strong>Launcher</strong><p>Windows v{LAUNCHER_VERSION} · Android soon</p></div>
            <b>→</b>
          </Link>
          <a className="home-action" href={DISCORD_URL} target="_blank" rel="noreferrer">
            <span className="action-icon">◆</span>
            <div><small>COMMUNITY</small><strong>Discord</strong><p>Event · hỗ trợ · thông báo</p></div>
            <b>↗</b>
          </a>
        </section>

        <section className="home-highlight-band">
          <div><small>WORLD DEX</small><strong>Tìm đúng chỗ spawn, nhanh hơn.</strong></div>
          <p>Không cần nhớ lệnh hay lục Discord. Search tên Pokémon/Fakemon rồi lọc biome, thời gian, độ hiếm và loại spawn.</p>
          <Link href="/wiki">Tra cứu ngay →</Link>
        </section>
      </main>
    </div>
  );
}

function MobileHome() {
  return (
    <div className="portal-mobile mobile-only">
      <MobilePortalHeader title="Home" />
      <main className="mobile-home-main">
        <section className="mobile-brand-hero">
          <img src={LOGO} alt="Bestiary Beast" />
          <div className="portal-eyebrow">SVFRAME · COBBLEMON 1.8</div>
          <h1>Mở Dex.<br/>Biết spawn.</h1>
          <p>Pokémon, Fakemon, launcher và Discord trong một portal gọn.</p>
          <Link className="portal-primary full" href="/wiki">Tra cứu ngay <span>→</span></Link>
        </section>

        <section className="mobile-action-stack">
          <Link href="/wiki"><i>⌕</i><div><strong>World Dex</strong><small>Spawn · biome · condition</small></div><b>→</b></Link>
          <Link href="/play"><i>↓</i><div><strong>Launcher</strong><small>Windows v{LAUNCHER_VERSION} · Android soon</small></div><b>→</b></Link>
          <a href={DISCORD_URL} target="_blank" rel="noreferrer"><i>◆</i><div><strong>Discord</strong><small>Community & support</small></div><b>↗</b></a>
        </section>

        <section className="mobile-build-strip">
          <span><b>1.21.1</b><small>Minecraft</small></span>
          <span><b>1.8</b><small>Cobblemon</small></span>
          <span><b>LIVE</b><small>Server Dex</small></span>
        </section>
      </main>
      <MobilePortalNav active="home" />
    </div>
  );
}

export default function PortalHome() { return <><DesktopHome/><MobileHome/></>; }
