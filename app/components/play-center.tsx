import { DesktopPortalNav, MobilePortalHeader, MobilePortalNav } from "./portal-shell";
import { DISCORD_URL, LAUNCHER_DOWNLOAD_URL, LAUNCHER_RELEASES_URL, LAUNCHER_SIZE, LAUNCHER_VERSION } from "../data/portal";

const LOGO = `${process.env.NEXT_PUBLIC_BASE_PATH ?? "/website"}/brand/bestiary-logo.webp`;

function WindowsCard({ mobile = false }: { mobile?: boolean }) {
  return (
    <article className={`platform-card windows-card ${mobile ? "mobile-platform-card" : ""}`}>
      <div className="platform-card-top"><span className="platform-icon">⊞</span><span className="platform-status ready">READY</span></div>
      <small>WINDOWS</small>
      <h2>Bestiary Launcher</h2>
      <p>Stable v{LAUNCHER_VERSION} · {LAUNCHER_SIZE}</p>
      <a className="portal-primary full" href={LAUNCHER_DOWNLOAD_URL}>Tải .EXE <span>↓</span></a>
      <a className="platform-text-link" href={LAUNCHER_RELEASES_URL} target="_blank" rel="noreferrer">GitHub Releases ↗</a>
    </article>
  );
}

function AndroidCard({ mobile = false }: { mobile?: boolean }) {
  return (
    <article className={`platform-card android-card ${mobile ? "mobile-platform-card" : ""}`}>
      <div className="platform-card-top"><span className="platform-icon">◉</span><span className="platform-status soon">COMING SOON</span></div>
      <small>ANDROID</small>
      <h2>Bestiary Mobile</h2>
      <p>APK launcher cho điện thoại đang được chuẩn bị.</p>
      <button className="portal-secondary full" type="button" disabled>APK Coming Soon</button>
      <span className="platform-text-link muted">Sẽ phát hành qua GitHub</span>
    </article>
  );
}

function DesktopPlay() {
  return (
    <div className="portal-desktop desktop-only">
      <DesktopPortalNav active="play" />
      <main className="portal-main play-main-redesign">
        <section className="play-intro-redesign">
          <div>
            <div className="portal-eyebrow">BESTIARY CLIENT</div>
            <h1>Chọn thiết bị.<br/><span>Vào game.</span></h1>
            <p>Windows có launcher chính thức ngay bây giờ. Android đã có vị trí riêng và sẽ bật download khi APK release.</p>
          </div>
          <img src={LOGO} alt="Bestiary Beast" />
        </section>

        <section className="platform-grid">
          <WindowsCard />
          <AndroidCard />
        </section>

        <section className="play-steps-redesign">
          <div><small>01</small><strong>Tải launcher</strong><p>Chọn đúng platform và tải bản chính thức.</p></div>
          <div><small>02</small><strong>Cài & đăng nhập</strong><p>Launcher tự quản lý client cần thiết.</p></div>
          <div><small>03</small><strong>Play</strong><p>Đồng bộ xong là vào server.</p></div>
        </section>

        <section className="support-strip">
          <div><small>GẶP LỖI?</small><strong>Support nhanh trên Discord.</strong></div>
          <a href={DISCORD_URL} target="_blank" rel="noreferrer">Join Discord ↗</a>
        </section>
      </main>
    </div>
  );
}

function MobilePlay() {
  return (
    <div className="portal-mobile mobile-only">
      <MobilePortalHeader title="Launcher" />
      <main className="mobile-play-main-redesign">
        <section className="mobile-play-logo"><img src={LOGO} alt="Bestiary Beast"/><small>CHỌN THIẾT BỊ</small><h1>Bestiary Client</h1></section>
        <section className="mobile-platform-stack"><AndroidCard mobile/><WindowsCard mobile/></section>
        <section className="mobile-steps-redesign"><h2>Cài trong 3 bước</h2><div><b>1</b><span><strong>Tải</strong><small>Chọn platform.</small></span></div><div><b>2</b><span><strong>Cài</strong><small>Hoàn tất setup.</small></span></div><div><b>3</b><span><strong>Play</strong><small>Launcher đồng bộ client.</small></span></div></section>
        <a className="mobile-discord-banner" href={DISCORD_URL} target="_blank" rel="noreferrer"><span>◆</span><div><strong>Cần hỗ trợ?</strong><small>Join Discord SVFrame</small></div><b>→</b></a>
      </main>
      <MobilePortalNav active="play" />
    </div>
  );
}

export default function PlayCenter(){ return <><DesktopPlay/><MobilePlay/></>; }
