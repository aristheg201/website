"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { HUNTER_COIN_PRICE, formatVnd, passProducts, skins, type PassProduct } from "../data/catalog";
import { Brand, SiteHeader } from "./site-brand";

type Collection = "all" | "atelier" | "heroes" | "titans";
type CheckoutSelection = { title: string; amountVnd: number };

const collectionNames: Record<Collection, string> = {
  all: "Tất cả 29",
  atelier: "Atelier",
  heroes: "Heroes",
  titans: "Titanverse",
};

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/website";
const asset = (path: string) => `${BASE_PATH}${path}`;

function SkinRender({ image, size = 256, label }: { image: string; size?: number; label: string }) {
  return <Image className="skin-render" src={asset(image)} alt={label} width={size} height={size} unoptimized />;
}

function CheckoutModal({ selection, onClose }: { selection: CheckoutSelection; onClose: () => void }) {
  const [minecraftName, setMinecraftName] = useState("");
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  function confirm(event: FormEvent) {
    event.preventDefault();
    if (!/^[A-Za-z0-9_]{3,16}$/.test(minecraftName)) {
      setError("Tên Minecraft phải có 3–16 ký tự, chỉ gồm chữ, số và dấu gạch dưới.");
      return;
    }
    setError("");
    setConfirmed(true);
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Đóng">×</button>
        {!confirmed ? (
          <>
            <p className="kicker">Xác nhận nhân vật</p>
            <h2 id="checkout-title">Kiểm tra tên trước khi mua.</h2>
            <div className="modal-product"><span>{selection.title}</span><strong>{formatVnd(selection.amountVnd)}</strong></div>
            <form onSubmit={confirm} className="checkout-form">
              <label htmlFor="minecraft-name">Tên Minecraft</label>
              <input id="minecraft-name" value={minecraftName} onChange={(event) => setMinecraftName(event.target.value.trim())} placeholder="Ví dụ: HunterSteve" autoFocus maxLength={16} />
              {error && <p className="form-error">{error}</p>}
              <button className="primary-button" type="submit">Tiếp tục <span>→</span></button>
            </form>
          </>
        ) : (
          <>
            <p className="kicker">{minecraftName}</p>
            <h2 id="checkout-title">Thanh toán tự động đang tạm khóa.</h2>
            <p className="modal-message">Không chuyển khoản khi chưa được quản trị viên xác nhận trong server. Giá sản phẩm vẫn được giữ đúng như hiển thị bên dưới.</p>
            <div className="modal-product"><span>{selection.title}</span><strong>{formatVnd(selection.amountVnd)}</strong></div>
            <div className="warning-box">Chỉ thanh toán khi bạn nhận được mã đơn và hướng dẫn chính thức.</div>
          </>
        )}
      </section>
    </div>
  );
}

function PassCard({ product, onBuy }: { product: PassProduct; onBuy: (product: PassProduct) => void }) {
  const reward = product.rewards[0];
  const unit = reward.rewardType === "hunter_coin" ? "HC" : "Points";
  const total = reward.dailyAmount * product.durationDays + (reward.bonusAmount ?? 0);
  return (
    <article className="pass-card">
      <div className="pass-tag"><span>{product.server}</span><span>{product.durationDays} ngày</span></div>
      <h3>Thẻ {product.shortTitle}</h3>
      <p>Nhận <strong>{reward.dailyAmount} {unit}</strong> mỗi ngày đăng nhập{reward.bonusAmount ? ` và thêm ${reward.bonusAmount} ${unit} khi mua.` : "."}</p>
      <div className="pass-reward"><small>Tổng quyền lợi</small><strong>{total.toLocaleString("vi-VN")} {unit}</strong></div>
      <div className="card-buy"><b>{formatVnd(product.priceVnd)}</b><button type="button" onClick={() => onBuy(product)}>Chọn</button></div>
    </article>
  );
}

export default function Storefront() {
  const [collection, setCollection] = useState<Collection>("all");
  const [showAllSkins, setShowAllSkins] = useState(false);
  const [serverTab, setServerTab] = useState<"Cobblemon" | "RPG">("Cobblemon");
  const [coinQuantity, setCoinQuantity] = useState(5);
  const [checkout, setCheckout] = useState<CheckoutSelection | null>(null);

  const filteredSkins = useMemo(() => skins.filter((item) => collection === "all" || item.collection === collection), [collection]);
  const visibleSkins = showAllSkins ? filteredSkins : filteredSkins.slice(0, 8);
  const serverPasses = passProducts.filter((product) => product.server === serverTab);
  const combo = passProducts.find((product) => product.code === "monthly-combo")!;

  function buyPass(product: PassProduct) {
    setCheckout({ title: product.title, amountVnd: product.priceVnd });
  }

  function buyCoins() {
    const quantity = Math.min(200, Math.max(1, Math.floor(coinQuantity || 1)));
    setCoinQuantity(quantity);
    setCheckout({ title: `${quantity} Hunter Coin`, amountVnd: quantity * HUNTER_COIN_PRICE });
  }

  return (
    <main id="top">
      <SiteHeader />

      <section className="hero section-shell">
        <div className="hero-copy">
          <p className="kicker">Hunter Network · Cobblemon & RPG</p>
          <h1>Skin thật.<br />Giá rõ.<br /><span>Vào game.</span></h1>
          <p className="hero-lead">Xem đủ 29 skin, tra Pokémon theo biome, tải đúng bộ mod và kiểm tra giá Hunter Coin tại một chỗ.</p>
          <div className="hero-actions">
            <a className="primary-button" href="#skins">Xem skin <span>→</span></a>
            <Link className="secondary-button" href="/wiki">Mở Wiki Pokémon</Link>
          </div>
          <div className="hero-stats">
            <div><b>29</b><span>skin trong shop</span></div>
            <div><b>897</b><span>Pokémon có dữ liệu spawn</span></div>
            <div><b>25.000₫</b><span>mỗi Hunter Coin</span></div>
          </div>
        </div>

        <div className="hero-showcase" aria-label="Skin nổi bật">
          <div className="hero-render hero-render-main">
            <SkinRender image="/skins/gardevoir.png" size={300} label="Gardevoir 2B" />
            <div><small>Atelier</small><strong>Gardevoir · 2B</strong></div>
          </div>
          <div className="hero-render hero-render-side hero-render-left"><SkinRender image="/skins/lucario.png" size={132} label="Lucario Batman" /><span>Batman</span></div>
          <div className="hero-render hero-render-side hero-render-right"><SkinRender image="/skins/tyranitar.png" size={132} label="Tyranitar Godzilla" /><span>Godzilla</span></div>
        </div>
      </section>

      <section className="quick-links">
        <div className="section-shell quick-links-grid">
          <div><span>Server</span><strong>poke.sv-frame.com</strong><small>Fabric 1.21.1 · Loader 0.18.4</small></div>
          <a href="https://drive.google.com/file/d/101G-TRlgvjL88AWbkGw0WgpBFt-5DaeW/view?usp=drive_link" target="_blank" rel="noreferrer"><span>PC khỏe</span><strong>Tải bản Full</strong><small>Mở Google Drive →</small></a>
          <a href="https://drive.google.com/file/d/1WfL_tZ6hCMEItfbsKbymVXUV5fP0NOKw/view?usp=drive_link" target="_blank" rel="noreferrer"><span>Android / PC yếu</span><strong>Tải bản Lite</strong><small>Mở Google Drive →</small></a>
          <Link href="/huong-dan"><span>Cài đặt</span><strong>Hướng dẫn từ A–Z</strong><small>Xem từng bước →</small></Link>
        </div>
      </section>

      <section id="skins" className="content-section section-shell">
        <div className="section-head">
          <div><p className="kicker">Shop skin</p><h2>Danh sách 29 skin.</h2></div>
          <p>Chọn bộ sưu tập để xem đúng skin đang có trong server. Tên Pokémon và tên skin được tách rõ để không nhầm mẫu.</p>
        </div>
        <div className="filter-row" role="group" aria-label="Lọc bộ sưu tập">
          {(Object.keys(collectionNames) as Collection[]).map((key) => (
            <button type="button" key={key} className={collection === key ? "active" : ""} onClick={() => { setCollection(key); setShowAllSkins(false); }}>{collectionNames[key]}</button>
          ))}
        </div>
        <div className="skin-grid">
          {visibleSkins.map((item) => (
            <article className={`skin-card tone-${item.collection}`} key={item.id}>
              <div className="skin-image"><SkinRender image={item.image} label={`Skin ${item.pokemon} ${item.name}`} /></div>
              <div className="skin-info"><div><small>{item.pokemon}</small><h3>{item.name}</h3></div><span>{collectionNames[item.collection]}</span></div>
            </article>
          ))}
        </div>
        {filteredSkins.length > 8 && <button type="button" className="show-more" onClick={() => setShowAllSkins((value) => !value)}>{showAllSkins ? "Thu gọn" : `Xem đủ ${filteredSkins.length} skin`}</button>}
      </section>

      <section id="passes" className="passes-section">
        <div className="section-shell">
          <div className="section-head light">
            <div><p className="kicker">Thẻ server</p><h2>Chọn đúng nơi bạn đang chơi.</h2></div>
            <p>Quyền lợi được tính theo ngày đăng nhập. Cobblemon nhận Hunter Coin, RPG nhận Points.</p>
          </div>
          <div className="server-switch"><button type="button" className={serverTab === "Cobblemon" ? "active" : ""} onClick={() => setServerTab("Cobblemon")}>Cobblemon</button><button type="button" className={serverTab === "RPG" ? "active" : ""} onClick={() => setServerTab("RPG")}>RPG</button></div>
          <div className="passes-layout">
            <div className="pass-grid">{serverPasses.map((product) => <PassCard key={product.code} product={product} onBuy={buyPass} />)}</div>
            <article className="combo-card">
              <p className="kicker">Dùng cho cả hai server</p>
              <h3>Super Combo</h3>
              <p>30 ngày · mỗi ngày nhận 2 Hunter Coin và 50 RPG Points.</p>
              <div className="combo-visual"><Image src={asset("/art/hunter-coin.png")} alt="Hunter Coin" width={112} height={112} unoptimized /><span>+</span><b>50<br /><small>Points</small></b></div>
              <div className="card-buy"><b>{formatVnd(combo.priceVnd)}</b><button type="button" onClick={() => buyPass(combo)}>Chọn</button></div>
            </article>
          </div>
        </div>
      </section>

      <section id="topup" className="topup-section section-shell">
        <div className="topup-copy">
          <p className="kicker">Hunter Coin · Cobblemon</p>
          <h2>25.000₫ <span>= 1 HC</span></h2>
          <p>Dùng để mua skin và vật phẩm giới hạn trong server. Chọn số lượng để kiểm tra đúng tổng tiền trước khi liên hệ quản trị viên.</p>
          <div className="coin-card"><Image src={asset("/art/hunter-coin.png")} alt="Hunter Coin trong server" width={128} height={128} unoptimized /><div><small>Đơn vị nạp</small><strong>Hunter Coin</strong><span>Cobblemon Server</span></div></div>
        </div>
        <div className="topup-panel">
          <h3>Chọn số Hunter Coin</h3>
          <div className="quantity-presets">{[1, 5, 10, 20].map((value) => <button type="button" key={value} className={coinQuantity === value ? "active" : ""} onClick={() => setCoinQuantity(value)}>{value} HC</button>)}</div>
          <label htmlFor="coin-quantity">Số lượng khác</label>
          <div className="quantity-input"><button type="button" onClick={() => setCoinQuantity((value) => Math.max(1, value - 1))}>−</button><input id="coin-quantity" type="number" min="1" max="200" value={coinQuantity} onChange={(event) => setCoinQuantity(Math.min(200, Math.max(1, Number(event.target.value) || 1)))} /><span>HC</span><button type="button" onClick={() => setCoinQuantity((value) => Math.min(200, value + 1))}>+</button></div>
          <div className="order-total"><span>Tổng tiền</span><strong>{formatVnd(coinQuantity * HUNTER_COIN_PRICE)}</strong></div>
          <button type="button" className="primary-button full" onClick={buyCoins}>Kiểm tra thông tin <span>→</span></button>
          <p className="payment-note">Không chuyển khoản khi chưa có xác nhận và mã đơn riêng.</p>
        </div>
      </section>

      <section id="leaderboard" className="leaderboard-section">
        <div className="section-shell leaderboard-layout">
          <div><p className="kicker">Top nạp tháng này</p><h2>Bảng xếp hạng đang chờ dữ liệu.</h2><p>Chỉ các giao dịch đã được xác nhận mới xuất hiện tại đây.</p></div>
          <div className="leaderboard-empty"><strong>Chưa có tên trong bảng</strong><span>Khi bảng mở, thứ hạng và tổng nạp sẽ được cập nhật tại khu vực này.</span></div>
        </div>
      </section>

      <footer><div className="section-shell footer-grid"><Brand /><p>Shop và Wiki chính thức của Hunter Network.</p><div><Link href="/#skins">Skin</Link><Link href="/huong-dan">Tải mod</Link><Link href="/wiki">Wiki spawn</Link></div><span>© {new Date().getFullYear()} Hunter Network</span></div></footer>
      {checkout && <CheckoutModal selection={checkout} onClose={() => setCheckout(null)} />}
    </main>
  );
}
