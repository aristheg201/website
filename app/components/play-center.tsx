import Link from "next/link";
import { DesktopPortalNav, MobilePortalHeader, MobilePortalNav } from "./portal-shell";
import { DISCORD_URL, LAUNCHER_DOWNLOAD_URL, LAUNCHER_RELEASES_URL, LAUNCHER_SIZE, LAUNCHER_VERSION } from "../data/portal";

function DownloadButton({ mobile = false }: { mobile?: boolean }) {
  return <a className={mobile ? "portal-primary full" : "portal-primary"} href={LAUNCHER_DOWNLOAD_URL}>Tải Bestiary Launcher {LAUNCHER_VERSION} <span>↓</span></a>;
}

function DesktopPlay() {
  return (
    <div className="portal-desktop desktop-only">
      <DesktopPortalNav active="play" />
      <main className="portal-main play-main">
        <section className="play-hero">
          <div>
            <div className="portal-eyebrow">SVFRAME CLIENT · WINDOWS</div>
            <h1>Vào server.<br/><span>Không cần tự ráp modpack.</span></h1>
            <p>Bestiary Launcher cài và cập nhật client của server, quản lý nội dung tùy chọn và hỗ trợ đăng nhập Microsoft hoặc tài khoản local của server.</p>
            <div className="portal-actions"><DownloadButton/><a className="portal-secondary" href={LAUNCHER_RELEASES_URL} target="_blank" rel="noreferrer">Xem GitHub Releases</a></div>
          </div>
          <div className="launcher-panel">
            <div className="launcher-window-bar"><span/><span/><span/><b>BESTIARY LAUNCHER</b></div>
            <div className="launcher-logo">B</div>
            <strong>Ready to play</strong>
            <p>Stable channel · v{LAUNCHER_VERSION}</p>
            <button type="button" disabled>PLAY</button>
          </div>
        </section>

        <section className="download-facts">
          <article><small>VERSION</small><strong>{LAUNCHER_VERSION}</strong><span>Stable</span></article>
          <article><small>PLATFORM</small><strong>Windows</strong><span>Installer .exe</span></article>
          <article><small>SIZE</small><strong>{LAUNCHER_SIZE}</strong><span>GitHub Releases</span></article>
          <article><small>GAME</small><strong>1.21.1</strong><span>Cobblemon 1.8</span></article>
        </section>

        <section className="play-help-grid">
          <article><span>1</span><div><strong>Tải installer</strong><p>Tải file chính thức từ GitHub Release của launcher.</p></div></article>
          <article><span>2</span><div><strong>Cài launcher</strong><p>Mở installer Windows và hoàn tất cài đặt.</p></div></article>
          <article><span>3</span><div><strong>Đăng nhập & Play</strong><p>Chọn tài khoản phù hợp rồi để launcher đồng bộ client.</p></div></article>
        </section>

        <section className="play-community-callout">
          <div><small>CẦN HỖ TRỢ?</small><strong>Vào Discord SVFrame</strong><p>Lỗi launcher, modpack hoặc cần hướng dẫn? Community và staff ở đây.</p></div>
          <a href={DISCORD_URL} target="_blank" rel="noreferrer">Join Discord ↗</a>
        </section>
      </main>
    </div>
  );
}

function MobilePlay() {
  return (
    <div className="portal-mobile mobile-only">
      <MobilePortalHeader title="Play" />
      <main>
        <section className="mobile-download-card">
          <div className="launcher-logo">B</div>
          <small>BESTIARY LAUNCHER</small>
          <h1>v{LAUNCHER_VERSION}</h1>
          <p>Windows · {LAUNCHER_SIZE}<br/>Minecraft 1.21.1 · Cobblemon 1.8</p>
          <DownloadButton mobile />
          <a className="mobile-text-link" href={LAUNCHER_RELEASES_URL} target="_blank" rel="noreferrer">Xem tất cả phiên bản trên GitHub ↗</a>
        </section>
        <section className="mobile-steps">
          <h2>Cài trong 3 bước</h2>
          <article><span>1</span><div><strong>Tải</strong><p>Installer chính thức từ GitHub.</p></div></article>
          <article><span>2</span><div><strong>Cài</strong><p>Mở file .exe và hoàn tất setup.</p></div></article>
          <article><span>3</span><div><strong>Play</strong><p>Đăng nhập và để launcher tự đồng bộ.</p></div></article>
        </section>
        <a className="mobile-discord-banner" href={DISCORD_URL} target="_blank" rel="noreferrer"><span>◈</span><div><strong>Cần hỗ trợ?</strong><small>Join Discord SVFrame</small></div><b>→</b></a>
      </main>
      <MobilePortalNav active="play" />
    </div>
  );
}

export default function PlayCenter(){ return <><DesktopPlay/><MobilePlay/></>; }
