import Link from "next/link";
import { DesktopPortalNav, MobilePortalHeader, MobilePortalNav } from "./portal-shell";
import { DISCORD_URL, LAUNCHER_VERSION } from "../data/portal";

function DesktopHome() {
  return (
    <div className="portal-desktop desktop-only">
      <DesktopPortalNav active="home" />
      <main className="portal-main">
        <section className="portal-hero">
          <div className="portal-eyebrow">SVFRAME NETWORK · COBBLEMON 1.8</div>
          <h1>Mọi thứ bạn cần.<br/><span>Ở một chỗ.</span></h1>
          <p>Tra cứu Pokémon và Fakemon theo biome, điều kiện spawn và độ hiếm. Tải launcher chính thức hoặc vào Discord của server trong một cú nhấp.</p>
          <div className="portal-actions">
            <Link className="portal-primary" href="/wiki">Mở World Dex <span>→</span></Link>
            <Link className="portal-secondary" href="/play">Tải Launcher</Link>
          </div>
        </section>

        <section className="portal-feature-grid">
          <Link className="portal-feature-card dex-card" href="/wiki">
            <small>01 · TRA CỨU</small>
            <strong>World Dex</strong>
            <p>Pokémon, Fakemon, custom form, biome, thời gian, level và condition spawn.</p>
            <span>Tra cứu ngay →</span>
          </Link>
          <Link className="portal-feature-card play-card" href="/play">
            <small>02 · PLAY</small>
            <strong>Bestiary Launcher</strong>
            <p>Windows · v{LAUNCHER_VERSION} · cài đặt và cập nhật client của server.</p>
            <span>Tải launcher →</span>
          </Link>
          <a className="portal-feature-card discord-card" href={DISCORD_URL} target="_blank" rel="noreferrer">
            <small>03 · COMMUNITY</small>
            <strong>Discord</strong>
            <p>Thông báo, hỗ trợ, event, trao đổi và cập nhật mới nhất của SVFrame.</p>
            <span>Tham gia Discord ↗</span>
          </a>
        </section>

        <section className="portal-strip">
          <div><small>SERVER</small><strong>SVFrame Cobblemon</strong></div>
          <div><small>MINECRAFT</small><strong>1.21.1</strong></div>
          <div><small>COBBLEMON</small><strong>1.8</strong></div>
          <div><small>DEX</small><strong>Pokémon + Fakemon</strong></div>
        </section>
      </main>
    </div>
  );
}

function MobileHome() {
  return (
    <div className="portal-mobile mobile-only">
      <MobilePortalHeader title="Home" />
      <main>
        <section className="mobile-hero-card">
          <div className="portal-eyebrow">SVFRAME · COBBLEMON 1.8</div>
          <h1>Poké Portal</h1>
          <p>Tra spawn. Tải launcher. Vào Discord.</p>
          <Link className="portal-primary" href="/wiki">Tra Pokémon <span>→</span></Link>
        </section>

        <section className="mobile-quick-grid">
          <Link href="/wiki"><i>⌕</i><strong>World Dex</strong><small>Spawn & biome</small></Link>
          <Link href="/play"><i>↓</i><strong>Launcher</strong><small>Windows v{LAUNCHER_VERSION}</small></Link>
          <a href={DISCORD_URL} target="_blank" rel="noreferrer"><i>◈</i><strong>Discord</strong><small>Community</small></a>
        </section>

        <section className="mobile-info-card">
          <small>SERVER BUILD</small>
          <div><span>Minecraft</span><b>1.21.1</b></div>
          <div><span>Cobblemon</span><b>1.8</b></div>
          <div><span>Nội dung</span><b>Pokémon + Fakemon</b></div>
        </section>
      </main>
      <MobilePortalNav active="home" />
    </div>
  );
}

export default function PortalHome() {
  return <><DesktopHome/><MobileHome/></>;
}
