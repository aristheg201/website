"use client";

import { useState } from "react";
import Link from "next/link";
import { Brand, SiteHeader } from "./site-brand";

const FULL_PACK = "https://drive.google.com/file/d/101G-TRlgvjL88AWbkGw0WgpBFt-5DaeW/view?usp=drive_link";
const LITE_PACK = "https://drive.google.com/file/d/1WfL_tZ6hCMEItfbsKbymVXUV5fP0NOKw/view?usp=drive_link";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }
  return <button type="button" onClick={copy}>{copied ? "Đã chép" : "Chép IP"}</button>;
}

export default function InstallGuide() {
  return (
    <main className="subpage guide-page">
      <SiteHeader ctaHref="#downloads" ctaLabel="Tải mod" />

      <section className="subpage-hero guide-hero section-shell">
        <div>
          <p className="kicker">Hướng dẫn cài Cobblemon</p>
          <h1>Đúng phiên bản.<br /><span>Vào server ngay.</span></h1>
          <p>Chọn Full cho PC khỏe hoặc Lite cho Android và máy yếu. Không trộn hai gói với nhau và không chép đè lên một bộ mod cũ chưa sao lưu.</p>
        </div>
        <aside className="version-ticket">
          <p className="kicker">Phiên bản bắt buộc</p>
          <div><small>Minecraft</small><strong>1.21.1</strong></div>
          <div><small>Fabric Loader</small><strong>0.18.4</strong></div>
          <p>Resource pack sẽ được server gửi khi bạn kết nối.</p>
        </aside>
      </section>

      <section className="server-connect section-shell" aria-labelledby="server-connect-title">
        <div className="section-head compact"><div><p className="kicker">Kết nối</p><h2 id="server-connect-title">IP server</h2></div></div>
        <div className="address-grid">
          <article><div><span>IP chính</span><strong>poke.sv-frame.com</strong></div><CopyButton value="poke.sv-frame.com" /></article>
          <article><div><span>IP phụ</span><strong>poke.sv-frame.com:19000</strong></div><CopyButton value="poke.sv-frame.com:19000" /></article>
        </div>
        <p className="connection-note">Không vào được IP chính thì thử IP phụ. Trong mục Server Resource Packs, chọn <b>Enabled</b> hoặc <b>Prompt</b>.</p>
      </section>

      <section id="downloads" className="downloads-section">
        <div className="section-shell">
          <div className="section-head light"><div><p className="kicker">Chọn bộ cài</p><h2>Máy nào, bản đó.</h2></div><p>Bản Full giữ đầy đủ tính năng và hiệu ứng. Bản Lite cắt bớt phần nặng để chạy ổn hơn trên thiết bị yếu.</p></div>
          <div className="download-card-grid">
            <article className="download-card full-pack"><div><span>Full Pack</span><small>PC khỏe</small></div><h3>Đầy đủ mod và hiệu ứng.</h3><ul><li>Dành cho máy bàn hoặc laptop cấu hình tốt</li><li>Giữ đầy đủ nội dung Cobblemon của server</li><li>Tạo instance mới trước khi cài</li></ul><a className="primary-button" href={FULL_PACK} target="_blank" rel="noreferrer">Tải bản Full <span>→</span></a></article>
            <article className="download-card lite-pack"><div><span>Lite Pack</span><small>Android / PC yếu</small></div><h3>Nhẹ hơn, vẫn đủ để chơi.</h3><ul><li>Dành cho launcher Java Edition trên Android</li><li>Phù hợp máy ít RAM hoặc GPU yếu</li><li>Không trộn file từ bản Full</li></ul><a className="primary-button" href={LITE_PACK} target="_blank" rel="noreferrer">Tải bản Lite <span>→</span></a></article>
          </div>
        </div>
      </section>

      <section className="install-steps section-shell">
        <div className="section-head"><div><p className="kicker">Cài đặt</p><h2>Làm theo từng bước.</h2></div><p>Tạo một instance riêng giúp tránh xung đột mod và dễ quay lại bản cũ khi cần.</p></div>
        <div className="platform-grid">
          <article><span className="platform-label">PC · Java Edition</span><ol><li><b>Tải đúng gói.</b><p>Máy khỏe lấy Full; máy yếu lấy Lite.</p></li><li><b>Tạo profile Fabric.</b><p>Chọn Minecraft 1.21.1 và Fabric Loader 0.18.4.</p></li><li><b>Giải nén vào instance.</b><p>Giữ nguyên cấu trúc các thư mục trong gói.</p></li><li><b>Thêm server.</b><p>Dùng IP <code>poke.sv-frame.com</code> và chấp nhận resource pack.</p></li></ol></article>
          <article><span className="platform-label">Android · Java launcher</span><ol><li><b>Dùng bản Lite.</b><p>Không dùng bản Full trên điện thoại.</p></li><li><b>Tạo instance Fabric.</b><p>Đúng Minecraft 1.21.1 và Loader 0.18.4.</p></li><li><b>Chép pack đúng thư mục.</b><p>Chọn thư mục của instance đang chạy, không phải thư mục tải xuống.</p></li><li><b>Kết nối server.</b><p>Nếu IP chính lỗi, dùng <code>poke.sv-frame.com:19000</code>.</p></li></ol></article>
        </div>
      </section>

      <section className="troubleshoot-section"><div className="section-shell troubleshoot-grid"><div><p className="kicker">Gặp lỗi?</p><h2>Kiểm tra bốn chỗ này.</h2></div><div><details><summary>Game văng trước menu</summary><p>Kiểm tra đúng phiên bản Minecraft, Fabric Loader và chắc chắn chưa trộn Full/Lite với pack cũ.</p></details><details><summary>Vào server nhưng thiếu texture</summary><p>Bật Server Resource Packs, thoát server rồi vào lại để tải pack.</p></details><details><summary>Không kết nối được IP chính</summary><p>Thử IP phụ và kiểm tra mạng hoặc tường lửa của thiết bị.</p></details><details><summary>Không biết Pokémon spawn ở đâu</summary><p>Mở Wiki, gõ tên Pokémon hoặc biome để xem điều kiện spawn.</p></details></div></div></section>

      <footer><div className="section-shell footer-grid"><Brand /><p>Hunter Network Cobblemon.</p><div><Link href="/">Shop</Link><Link href="/wiki">Wiki spawn</Link><a href="#downloads">Tải mod</a></div><span>Cập nhật 29.05.2026</span></div></footer>
    </main>
  );
}
