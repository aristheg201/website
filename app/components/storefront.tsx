"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { HUNTER_COIN_PRICE, formatVnd, passProducts, skins, type PassProduct } from "../data/catalog";
import { Brand, SiteHeader } from "./site-brand";

type Collection = "all" | "atelier" | "heroes" | "titans";
type CheckoutSelection =
  | { kind: "hunter_coin"; code: "hunter-coin"; title: string; quantity: number; amountVnd: number }
  | { kind: "pass"; code: string; title: string; quantity: 1; amountVnd: number };

const collectionNames: Record<Collection, string> = {
  all: "Tất cả 29",
  atelier: "Atelier",
  heroes: "Heroes",
  titans: "Titanverse",
};

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/website";
const asset = (path: string) => `${BASE_PATH}${path}`;

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5" /></svg>;
}

function ShieldIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></svg>;
}

function CloseIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 4 12 12M16 4 4 16" /></svg>;
}

function CheckoutModal({ selection, onClose }: { selection: CheckoutSelection; onClose: () => void }) {
  const [minecraftName, setMinecraftName] = useState("");
  const [error, setError] = useState("");
  const [checked, setChecked] = useState(false);

  function checkOrder(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!/^[A-Za-z0-9_]{3,16}$/.test(minecraftName)) {
      setError("Tên Minecraft phải dài 3–16 ký tự, chỉ gồm chữ, số và dấu gạch dưới.");
      return;
    }
    setChecked(true);
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
        <button className="icon-button modal-close" onClick={onClose} aria-label="Đóng"><CloseIcon /></button>
        {!checked ? (
          <>
            <span className="eyebrow">KIỂM TRA GIÁ / BẢN PUBLIC</span>
            <h2 id="checkout-title">Gõ đúng tên game<br />trước khi nạp.</h2>
            <div className="modal-product">
              <div><small>Sản phẩm</small><strong>{selection.title}</strong></div>
              <b>{formatVnd(selection.amountVnd)}</b>
            </div>
            <form onSubmit={checkOrder} className="checkout-form">
              <label htmlFor="minecraft-name">Tên Minecraft</label>
              <input id="minecraft-name" value={minecraftName} onChange={(event) => setMinecraftName(event.target.value.trim())} placeholder="VD: HunterSteve" autoFocus autoComplete="off" maxLength={16} />
              <p className="field-hint">Tên này sẽ được dùng khi cổng giao tự động được bật.</p>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="button button-primary button-wide">
                <span>KIỂM TRA THÔNG TIN</span><ArrowIcon />
              </button>
            </form>
          </>
        ) : (
          <>
            <span className="eyebrow">{minecraftName} / {selection.title}</span>
            <h2 id="checkout-title">Đúng giá rồi.<br />Chưa chuyển tiền.</h2>
            <div className="payment-not-configured"><span>!</span><div><strong>Cổng QR tự động chưa hoạt động</strong><p>GitHub Pages chỉ chạy giao diện tĩnh. Chờ Admin kết nối backend rồi web mới tạo mã đơn và giao vật phẩm tự động.</p></div></div>
            <div className="transfer-summary">
              <div><small>Giá dự kiến</small><strong>{formatVnd(selection.amountVnd)}</strong></div>
              <div><small>Trạng thái</small><code>CHƯA MỞ THANH TOÁN</code></div>
            </div>
            <p className="poll-note"><i /> Không chuyển khoản nếu web chưa hiện QR và mã đơn riêng.</p>
          </>
        )}
      </section>
    </div>
  );
}

function PassCard({ product, onBuy }: { product: PassProduct; onBuy: (product: PassProduct) => void }) {
  const reward = product.rewards[0];
  const unit = reward.rewardType === "hunter_coin" ? "HC" : "Points";
  const total = reward.dailyAmount * product.durationDays + (reward.bonusAmount || 0);
  return (
    <article className="pass-card">
      <div className="pass-top"><span>{product.server}</span><b>{product.durationDays} ngày</b></div>
      <h3>Thẻ {product.shortTitle}</h3>
      <p>Mỗi ngày login nhận <strong>{reward.dailyAmount} {unit}</strong>{reward.bonusAmount ? `, cộng nóng ${reward.bonusAmount} ${unit} lúc mua.` : "."}</p>
      <div className="pass-total"><small>Tổng quyền lợi</small><strong>{total.toLocaleString("vi-VN")} {unit}</strong></div>
      <div className="pass-buy"><b>{formatVnd(product.priceVnd)}</b><button onClick={() => onBuy(product)} aria-label={`Mua ${product.title}`}><ArrowIcon /></button></div>
    </article>
  );
}

export default function Storefront() {
  const [collection, setCollection] = useState<Collection>("all");
  const [showAllSkins, setShowAllSkins] = useState(false);
  const [serverTab, setServerTab] = useState<"Cobblemon" | "RPG">("Cobblemon");
  const [coinQuantity, setCoinQuantity] = useState(5);
  const [checkout, setCheckout] = useState<CheckoutSelection | null>(null);

  const filteredSkins = useMemo(() => skins.filter((skin) => collection === "all" || skin.collection === collection), [collection]);
  const visibleSkins = showAllSkins ? filteredSkins : filteredSkins.slice(0, 8);
  const serverPasses = passProducts.filter((product) => product.server === serverTab);
  const combo = passProducts.find((product) => product.code === "monthly-combo")!;

  function buyPass(product: PassProduct) {
    setCheckout({ kind: "pass", code: product.code, title: product.title, quantity: 1, amountVnd: product.priceVnd });
  }

  function buyCoins() {
    const safeQuantity = Math.min(200, Math.max(1, Math.floor(coinQuantity || 1)));
    setCoinQuantity(safeQuantity);
    setCheckout({ kind: "hunter_coin", code: "hunter-coin", title: `${safeQuantity} Hunter Coin`, quantity: safeQuantity, amountVnd: safeQuantity * HUNTER_COIN_PRICE });
  }

  return (
    <main id="top">
      <div className="site-noise" />
      <SiteHeader />

      <section className="hero section-shell">
        <div className="hero-copy">
          <span className="eyebrow"><i /> HUNTER NETWORK / COBBLEMON + RPG</span>
          <h1><span>SKIN HIẾM.</span><br />NẠP GỌN.<br /><em>VÀO GAME.</em></h1>
          <p>Xem trọn catalog skin, giá Hunter Coin và các gói thẻ. Cổng QR tự động sẽ mở sau khi backend được kết nối.</p>
          <div className="hero-actions">
            <a href="#topup" className="button button-primary"><span>XEM GIÁ HUNTER COIN</span><ArrowIcon /></a>
            <a href="#skins" className="button button-ghost"><span>XEM 29 SKIN</span></a>
          </div>
          <div className="hero-facts">
            <div><b>29</b><span>skin trong shop</span></div>
            <div><b>25K</b><span>cho 1 Hunter Coin</span></div>
            <div><b>FREE</b><span>web public 24/7</span></div>
          </div>
        </div>

        <div className="hero-display" aria-label="Các bộ sưu tập nổi bật">
          <div className="display-orbit orbit-one" /><div className="display-orbit orbit-two" />
          <div className="hero-card hero-card-main">
            <span className="card-index">#01 / ATELIER</span>
            <Image src={asset("/skins/gardevoir.png")} alt="Gardevoir - ảnh đại diện bộ Atelier" width={272} height={224} priority unoptimized />
            <div><small>FEATURED DROP</small><strong>GARDEVOIR / 2B</strong></div>
          </div>
          <div className="hero-card hero-card-left"><Image src={asset("/skins/lucario.png")} alt="Lucario - ảnh đại diện bộ Heroes" width={136} height={112} unoptimized /><b>BATMAN</b></div>
          <div className="hero-card hero-card-right"><Image src={asset("/skins/tyranitar.png")} alt="Tyranitar - ảnh đại diện bộ Titanverse" width={136} height={112} unoptimized /><b>GODZILLA</b></div>
          <div className="celestial-stamp"><span>✦</span><small>SERVER<br />EXCLUSIVE</small></div>
        </div>
      </section>

      <div className="ticker" aria-hidden="true"><div>29 SKIN <span>✦</span> WIKI SPAWN <span>✦</span> TẢI MOD FULL + LITE <span>✦</span> 29 SKIN <span>✦</span> WIKI SPAWN <span>✦</span> TẢI MOD FULL + LITE</div></div>

      <section className="server-portal section-shell" aria-label="Tải mod và tra cứu server">
        <div className="portal-status">
          <span className="eyebrow"><i /> BỘ CÀI COBBLEMON / UPDATE 29.05.2026</span>
          <h2>VÀO SERVER<br /><em>CHO ĐÚNG BẢN.</em></h2>
          <div className="server-address"><small>IP chính</small><strong>poke.sv-frame.com</strong><span>Fabric 1.21.1 · Loader 0.18.4</span></div>
        </div>
        <div className="portal-actions">
          <a className="portal-card portal-full" href="https://drive.google.com/file/d/101G-TRlgvjL88AWbkGw0WgpBFt-5DaeW/view?usp=drive_link" target="_blank" rel="noreferrer">
            <span>01 / PC KHỎE</span><strong>FULL<br />TÍNH NĂNG</strong><small>Mở link tải ↗</small>
          </a>
          <a className="portal-card portal-lite" href="https://drive.google.com/file/d/1WfL_tZ6hCMEItfbsKbymVXUV5fP0NOKw/view?usp=drive_link" target="_blank" rel="noreferrer">
            <span>02 / ANDROID + PC YẾU</span><strong>BẢN<br />LITE</strong><small>Mở link tải ↗</small>
          </a>
          <div className="portal-links">
            <Link href="/huong-dan"><span>Hướng dẫn cài từ A–Z</span><ArrowIcon /></Link>
            <Link href="/wiki"><span>Wiki Pokémon & biome spawn</span><ArrowIcon /></Link>
          </div>
        </div>
      </section>

      <section id="skins" className="skins-section section-shell">
        <div className="section-heading split-heading">
          <div><span className="eyebrow">SHOP / 29 SKIN ĐÃ ĐỐI CHIẾU</span><h2>MẶC GÌ<br /><em>CHO CÓ GU?</em></h2></div>
          <p>Catalog lấy từ đúng bộ skin đang có trong pack server. Ảnh nhỏ là Pokémon đại diện; vào game mới thấy đủ model, hiệu ứng và animation của từng skin.</p>
        </div>
        <div className="filter-row" role="group" aria-label="Lọc bộ sưu tập">
          {(Object.keys(collectionNames) as Collection[]).map((key) => <button key={key} className={collection === key ? "active" : ""} onClick={() => { setCollection(key); setShowAllSkins(false); }}>{collectionNames[key]}</button>)}
        </div>
        <div className="skin-grid">
          {visibleSkins.map((skin, index) => (
            <article className={`skin-card tone-${skin.collection}`} key={skin.id}>
              <div className="skin-art"><span>{String(index + 1).padStart(2, "0")}</span><Image src={asset(skin.image)} alt={`${skin.pokemon} - ảnh đại diện`} width={170} height={140} unoptimized /></div>
              <div className="skin-meta"><small>{skin.pokemon}</small><h3>{skin.name}</h3><span>{collectionNames[skin.collection]}</span></div>
              <a href="#topup" aria-label={`Nạp Hunter Coin để mua skin ${skin.pokemon} ${skin.name}`}><ArrowIcon /></a>
            </article>
          ))}
        </div>
        {filteredSkins.length > 8 && <button className="show-more" onClick={() => setShowAllSkins((value) => !value)}>{showAllSkins ? "THU GỌN" : `XEM ĐỦ ${filteredSkins.length} SKIN`}<span>+</span></button>}
      </section>

      <section id="passes" className="passes-section">
        <div className="section-shell">
          <div className="section-heading split-heading light-heading">
            <div><span className="eyebrow">THẺ ĐẶC QUYỀN / LOGIN LÀ CÓ QUÀ</span><h2>CHƠI BÊN NÀO,<br /><em>LẤY THẺ BÊN ĐÓ.</em></h2></div>
            <p>Không cần ôm cả hai server. Chọn đúng nơi mình đang cày; quyền lợi được tính theo ngày login.</p>
          </div>
          <div className="server-switch" role="group" aria-label="Chọn server">
            <button className={serverTab === "Cobblemon" ? "active" : ""} onClick={() => setServerTab("Cobblemon")}>COBBLEMON</button>
            <button className={serverTab === "RPG" ? "active" : ""} onClick={() => setServerTab("RPG")}>RPG</button>
          </div>
          <div className="passes-layout">
            <div className="pass-grid">{serverPasses.map((product) => <PassCard key={product.code} product={product} onBuy={buyPass} />)}</div>
            <article className="combo-card">
              <div className="combo-glow" /><span className="combo-label">ADMIN KHUYÊN DÙNG</span>
              <div className="combo-head"><span>30 ngày</span><Image src={asset("/art/skin-key.png")} alt="" width={88} height={88} unoptimized /></div>
              <h3>SUPER<br /><em>COMBO</em></h3>
              <p>Mỗi ngày login nhận cùng lúc:</p>
              <div className="combo-rewards"><span><b>2</b> Hunter Coins</span><i>+</i><span><b>50</b> RPG Points</span></div>
              <div className="combo-buy"><div><small>Giá chốt</small><strong>{formatVnd(combo.priceVnd)}</strong></div><button className="button button-primary" onClick={() => buyPass(combo)}><span>MÚC COMBO</span><ArrowIcon /></button></div>
            </article>
          </div>
        </div>
      </section>

      <section id="topup" className="topup-section section-shell">
        <div className="topup-copy">
          <span className="eyebrow">NẠP HUNTER COIN / COBBLEMON</span>
          <h2>25.000₫<br /><em>= 1 HC.</em></h2>
          <p>Không phí ẩn, không quy đổi lòng vòng. Chọn số lượng để tính đúng giá; thanh toán chỉ mở khi web có QR và mã đơn riêng.</p>
          <div className="coin-proof"><Image src={asset("/art/hunter-coin.png")} alt="Hunter Coin trong server" width={112} height={112} unoptimized /><div><small>ĐÚNG LOẠI TIỀN TRONG SERVER</small><strong>Hunter Coin / Cobblemon</strong><span>Dùng mua skin và vật phẩm giới hạn</span></div></div>
        </div>
        <div className="topup-panel">
          <span className="panel-number">01</span><h3>Chọn số Hunter Coin</h3>
          <div className="quantity-presets">{[1, 5, 10, 20].map((value) => <button key={value} className={coinQuantity === value ? "active" : ""} onClick={() => setCoinQuantity(value)}>{value} HC</button>)}</div>
          <label htmlFor="coin-quantity">Hoặc nhập số lượng</label>
          <div className="quantity-input"><button onClick={() => setCoinQuantity((value) => Math.max(1, value - 1))} aria-label="Giảm một Hunter Coin">−</button><input id="coin-quantity" type="number" min="1" max="200" value={coinQuantity} onChange={(event) => setCoinQuantity(Math.min(200, Math.max(1, Number(event.target.value))))} /><span>HC</span><button onClick={() => setCoinQuantity((value) => Math.min(200, value + 1))} aria-label="Tăng một Hunter Coin">+</button></div>
          <div className="order-total"><span>Tổng thanh toán</span><strong>{formatVnd(coinQuantity * HUNTER_COIN_PRICE)}</strong></div>
          <button className="button button-primary button-wide" onClick={buyCoins}><span>KIỂM TRA THÔNG TIN</span><ArrowIcon /></button>
          <p className="secure-note"><ShieldIcon /> Chưa chuyển khoản nếu web chưa hiện QR và mã đơn riêng.</p>
        </div>
      </section>

      <section id="leaderboard" className="leaderboard-section">
        <div className="section-shell leaderboard-shell">
          <div className="leaderboard-copy"><span className="eyebrow">TOP NẠP / THÁNG NÀY</span><h2>AI ĐANG<br /><em>GÁNH SERVER?</em></h2><p>Bảng sẽ chỉ tính đơn được ngân hàng xác nhận sau khi backend thanh toán hoạt động.</p></div>
          <div className="leaderboard-board">
            <div className="board-head"><span>Hạng</span><span>Nhân vật</span><span>Đã nạp</span></div>
            <div className="board-empty"><Image src={asset("/art/skin-crate.png")} alt="" width={80} height={80} unoptimized /><strong>Top nạp đang chờ kết nối.</strong><span>GitHub Pages không chạy database; bảng sẽ sáng lên khi backend được bật.</span></div>
          </div>
        </div>
      </section>

      <section className="process-section section-shell">
        <div className="section-heading"><span className="eyebrow">BẢN PUBLIC HIỆN TẠI</span><h2>XEM TRƯỚC. NẠP SAU.</h2></div>
        <div className="process-grid">
          <article><b>01</b><h3>Xem skin và gói thẻ</h3><p>Catalog, quyền lợi và giá Hunter Coin đã mở công khai cho mọi người.</p></article>
          <article><b>02</b><h3>Chờ QR có mã đơn</h3><p>Chỉ thanh toán khi web hiện QR cùng mã đơn dành riêng cho tên Minecraft của bạn.</p></article>
          <article><b>03</b><h3>Backend bật là nhận tự động</h3><p>Khi cổng nạp được nối, ngân hàng xác nhận xong hệ thống mới chạy lệnh giao vật phẩm.</p></article>
        </div>
      </section>

      <footer><div className="section-shell footer-grid"><Brand /><p>Shop chính thức của Hunter Network.<br />Skin, Hunter Coin và thẻ cho hai server.</p><div><Link href="/#skins">Shop skin</Link><Link href="/huong-dan">Tải & cài mod</Link><Link href="/wiki">Wiki spawn</Link></div><span>© {new Date().getFullYear()} HUNTER NETWORK</span></div></footer>
      {checkout && <CheckoutModal selection={checkout} onClose={() => setCheckout(null)} />}
    </main>
  );
}
