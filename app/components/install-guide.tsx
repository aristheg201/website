"use client";

import { useState } from "react";
import Link from "next/link";
import { Brand, SiteHeader } from "./site-brand";

const FULL_PACK = "https://drive.google.com/file/d/101G-TRlgvjL88AWbkGw0WgpBFt-5DaeW/view?usp=drive_link";
const LITE_PACK = "https://drive.google.com/file/d/1WfL_tZ6hCMEItfbsKbymVXUV5fP0NOKw/view?usp=drive_link";

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5" /></svg>;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return <button type="button" onClick={copy}>{copied ? "ĐÃ CHÉP" : "CHÉP IP"}</button>;
}

export default function InstallGuide() {
  return (
    <main className="subpage guide-page">
      <div className="site-noise" />
      <SiteHeader ctaHref="#downloads" ctaLabel="TẢI MOD" />

      <section className="subpage-hero section-shell">
        <div>
          <span className="eyebrow"><i /> HƯỚNG DẪN CHÍNH THỨC / 29.05.2026</span>
          <h1>CÀI ĐÚNG.<br /><em>VÀO LUÔN.</em></h1>
          <p>Đừng trộn bản Full với bản Lite. Đúng Minecraft, đúng Fabric Loader rồi mới chép mod — làm theo thứ tự bên dưới là gọn nhất.</p>
        </div>
        <aside className="version-ticket">
          <span>BẮT BUỘC</span>
          <div><small>Minecraft</small><strong>1.21.1</strong></div>
          <div><small>Mod loader</small><strong>Fabric 0.18.4</strong></div>
          <p>Resourcepack của server tự tải khi vào game, không cần cài thủ công.</p>
        </aside>
      </section>

      <section className="server-connect section-shell" aria-labelledby="server-connect-title">
        <div className="section-heading">
          <span className="eyebrow">KẾT NỐI / 01</span>
          <h2 id="server-connect-title">IP SERVER.</h2>
        </div>
        <div className="address-grid">
          <article>
            <span>IP CHÍNH</span><strong>poke.sv-frame.com</strong><CopyButton value="poke.sv-frame.com" />
          </article>
          <article>
            <span>IP PHỤ</span><strong>poke.sv-frame.com:19000</strong><CopyButton value="poke.sv-frame.com:19000" />
          </article>
        </div>
        <p className="connection-note">Không vào được IP chính thì thử IP phụ. Trong mục Server Resource Packs, chọn <b>Enabled</b> hoặc <b>Prompt</b> để pack tự tải.</p>
      </section>

      <section id="downloads" className="downloads-section">
        <div className="section-shell">
          <div className="section-heading split-heading light-heading">
            <div><span className="eyebrow">CHỌN BỘ CÀI / 02</span><h2>MÁY NÀO,<br /><em>BẢN ĐÓ.</em></h2></div>
            <p>Bản Full giữ trọn tính năng và hiệu ứng. Bản Lite cắt bớt phần nặng để Android và máy yếu đỡ ngộp.</p>
          </div>
          <div className="download-card-grid">
            <article className="download-card full-pack">
              <div><span>FULL PACK</span><small>PC KHỎE</small></div>
              <h3>ĐỦ MOD.<br />ĐỦ HIỆU ỨNG.</h3>
              <ul><li>Ưu tiên máy bàn/laptop cấu hình tốt</li><li>Giữ đầy đủ tính năng của bộ Cobblemon</li><li>Không cài chồng lên bản Lite</li></ul>
              <a className="button button-primary" href={FULL_PACK} target="_blank" rel="noreferrer"><span>TẢI BẢN FULL</span><ArrowIcon /></a>
            </article>
            <article className="download-card lite-pack">
              <div><span>LITE PACK</span><small>ANDROID + PC YẾU</small></div>
              <h3>NHẸ HƠN.<br />VẪN VÀO ĐƯỢC.</h3>
              <ul><li>Dành cho launcher Java Edition trên Android</li><li>Phù hợp PC yếu hoặc ít RAM</li><li>Không trộn file từ bản Full</li></ul>
              <a className="button button-dark" href={LITE_PACK} target="_blank" rel="noreferrer"><span>TẢI BẢN LITE</span><ArrowIcon /></a>
            </article>
          </div>
        </div>
      </section>

      <section className="install-steps section-shell">
        <div className="section-heading split-heading">
          <div><span className="eyebrow">CÀI ĐẶT / 03</span><h2>LÀM TỪNG<br /><em>BƯỚC NÀY.</em></h2></div>
          <p>Nếu đang có một bộ mod cũ, tạo instance mới hoặc sao lưu trước. Đừng ném pack mới đè lên một đống mod không rõ phiên bản.</p>
        </div>
        <div className="platform-grid">
          <article>
            <span className="platform-label">PC / JAVA EDITION</span>
            <ol>
              <li><b>Tải đúng gói.</b><p>Máy khỏe lấy Full; máy yếu lấy Lite.</p></li>
              <li><b>Tạo profile Fabric.</b><p>Chọn Minecraft 1.21.1 và Fabric Loader 0.18.4.</p></li>
              <li><b>Giải nén vào thư mục game.</b><p>Chép nguyên cấu trúc <code>mods</code>, <code>config</code> và các thư mục đi kèm vào đúng instance.</p></li>
              <li><b>Mở Multiplayer.</b><p>Thêm <code>poke.sv-frame.com</code>, vào game và chấp nhận resourcepack server.</p></li>
            </ol>
          </article>
          <article>
            <span className="platform-label">ANDROID / JAVA LAUNCHER</span>
            <ol>
              <li><b>Dùng bản Lite.</b><p>Không tải bản Full cho điện thoại.</p></li>
              <li><b>Tạo instance Fabric.</b><p>Phiên bản phải là 1.21.1, Loader phải là 0.18.4.</p></li>
              <li><b>Chép pack vào instance.</b><p>Giải nén rồi chép đúng thư mục của instance đang chạy, không phải thư mục tải xuống.</p></li>
              <li><b>Thêm IP và vào server.</b><p>Nếu IP chính không bắt được, dùng <code>poke.sv-frame.com:19000</code>.</p></li>
            </ol>
          </article>
        </div>
      </section>

      <section className="troubleshoot-section">
        <div className="section-shell troubleshoot-grid">
          <div><span className="eyebrow">GẶP LỖI?</span><h2>SOI 4 CHỖ NÀY.</h2></div>
          <div>
            <details><summary>Game văng trước khi vào menu</summary><p>Kiểm tra lại đúng Minecraft 1.21.1, Fabric Loader 0.18.4 và chắc chắn chưa trộn mod Full/Lite với pack cũ.</p></details>
            <details><summary>Vào server nhưng không có texture</summary><p>Đặt Server Resource Packs thành Enabled hoặc Prompt, thoát server rồi vào lại để tải pack tự động.</p></details>
            <details><summary>Không kết nối được IP chính</summary><p>Thử IP phụ <code>poke.sv-frame.com:19000</code> và kiểm tra firewall/mạng của thiết bị.</p></details>
            <details><summary>Không biết Pokémon spawn ở đâu</summary><p>Mở Wiki, gõ tên Pokémon hoặc tên biome để xem cấp độ, khung giờ và độ hiếm lấy từ datapack server.</p></details>
          </div>
        </div>
      </section>

      <footer><div className="section-shell footer-grid"><Brand /><p>Hunter Network Cobblemon.<br />Đúng bản, đúng IP, vào game.</p><div><Link href="/">Shop</Link><Link href="/wiki">Wiki spawn</Link><a href="#downloads">Tải mod</a></div><span>UPDATE 29.05.2026</span></div></footer>
    </main>
  );
}
