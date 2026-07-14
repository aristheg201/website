"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import {
  HUNTER_COIN_PRICE,
  directSkins,
  formatVnd,
  gachaSkins,
  shopProducts,
  spendMilestones,
  topupPacks,
  type DirectSkin,
  type ShopProduct,
  type SkinCollection,
} from "../data/catalog";
import { Brand, SiteHeader } from "./site-brand";
import { skinRenderMap, SKIN_RENDER_COLS, SKIN_RENDER_ROWS } from "../data/skin-render-map";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/website";

type CatalogMode = "direct" | "gacha";
type Filter = "all" | SkinCollection;
type CheckoutSelection = { code: string; title: string; description: string; amountVnd: number };

const filterLabels: Record<Filter, string> = {
  all: "Tất cả",
  liger: "Liger / Zoid",
  hero: "Nhân vật",
  legendary: "Huyền thoại",
};

function SkinRender({ path, alt }: { path: string; alt: string }) {
  const render = skinRenderMap[path];
  if (!render) return <span className="skin-render-missing">Chưa có ảnh</span>;
  const globalIndex = render.page * 16 + render.index;
  const column = globalIndex % SKIN_RENDER_COLS;
  const row = Math.floor(globalIndex / SKIN_RENDER_COLS);
  return (
    <span
      className="skin-render"
      role="img"
      aria-label={alt}
      style={{
        backgroundImage: `url(${BASE_PATH}/skin-renders/atlas-small.webp)`,
        backgroundSize: `${SKIN_RENDER_COLS * 100}% ${SKIN_RENDER_ROWS * 100}%`,
        backgroundPosition: `${(column / (SKIN_RENDER_COLS - 1)) * 100}% ${(row / (SKIN_RENDER_ROWS - 1)) * 100}%`,
      }}
    />
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }
  return <button type="button" className="copy-button" onClick={copy}>{copied ? "Đã chép" : label}</button>;
}

function CheckoutModal({ selection, onClose }: { selection: CheckoutSelection; onClose: () => void }) {
  const [minecraftName, setMinecraftName] = useState("");
  const [error, setError] = useState("");
  const transferNote = `SVF ${minecraftName || "TENNV"} ${selection.code}`.toUpperCase().slice(0, 50);

  function validate(event: FormEvent) {
    event.preventDefault();
    if (!/^[A-Za-z0-9_]{3,16}$/.test(minecraftName)) {
      setError("Tên Minecraft phải có 3–16 ký tự, chỉ gồm chữ, số và dấu gạch dưới.");
      return;
    }
    setError("");
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="checkout-modal checkout-wide" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Đóng">×</button>
        <p className="kicker">Thanh toán</p>
        <h2 id="checkout-title">{selection.title}</h2>
        <div className="modal-product">
          <div><strong>{selection.title}</strong><span>{selection.description}</span></div>
          <b>{formatVnd(selection.amountVnd)}</b>
        </div>
        <div className="payment-layout">
          <div className="qr-frame">
            <img src={`${BASE_PATH}/payment/qr.webp`} alt="Mã QR thanh toán SVFrame Network" width={360} height={320} />
          </div>
          <form className="payment-details" onSubmit={validate}>
            <label htmlFor="minecraft-name">Tên Minecraft</label>
            <input id="minecraft-name" value={minecraftName} onChange={(event) => setMinecraftName(event.target.value.trim())} placeholder="Ví dụ: ArisGrindel" maxLength={16} autoComplete="off" />
            {error && <p className="form-error" role="alert">{error}</p>}
            <div><span>Số tiền</span><strong>{formatVnd(selection.amountVnd)}</strong><CopyButton value={String(selection.amountVnd)} label="Chép số tiền" /></div>
            <div><span>Nội dung chuyển khoản</span><code>{transferNote}</code><CopyButton value={transferNote} label="Chép nội dung" /></div>
            <div><span>Ngân hàng</span><strong>Timo Digital Bank by BVBank</strong></div>
            <div><span>Chủ tài khoản</span><strong>NGUYEN ICH LOC</strong></div>
            <div><span>Số tài khoản</span><code>9021485289581</code><CopyButton value="9021485289581" label="Chép STK" /></div>
            <button className="primary-button full" type="submit">Kiểm tra tên nhân vật</button>
          </form>
        </div>
        <p className="payment-warning">Sau khi chuyển khoản, gửi ảnh giao dịch cho Admin để xác nhận và trao vật phẩm.</p>
      </section>
    </div>
  );
}

function DirectSkinCard({ skin, onBuy }: { skin: DirectSkin; onBuy: (selection: CheckoutSelection) => void }) {
  return (
    <article className={`skin-card collection-${skin.collection}`}>
      <div className="skin-image">
        <SkinRender path={skin.image} alt={`${skin.pokemon} — ${skin.name}`} />
        {skin.featured && <span className="featured-tag">Nổi bật</span>}
      </div>
      <div className="skin-info">
        <div><small>{skin.pokemon}</small><h3>{skin.name}</h3></div>
        <div className="skin-price"><b>{skin.priceHC} HC</b><span>{formatVnd(skin.priceHC * HUNTER_COIN_PRICE)}</span></div>
        <button type="button" onClick={() => onBuy({ code: skin.id, title: `${skin.pokemon} · ${skin.name}`, description: `Skin ${skin.pokemon}`, amountVnd: skin.priceHC * HUNTER_COIN_PRICE })}>Mua</button>
      </div>
    </article>
  );
}

function ProductCard({ product, onBuy }: { product: ShopProduct; onBuy: (selection: CheckoutSelection) => void }) {
  return (
    <article className="bundle-card">
      <div className="bundle-cost"><b>{product.priceHC}</b><span>HC</span></div>
      <h3>{product.title}</h3>
      <ul>{product.rewards.map((reward) => <li key={reward}>{reward}</li>)}</ul>
      <button type="button" className="secondary-button" onClick={() => onBuy({ code: product.code, title: product.title, description: product.rewards.join(" · "), amountVnd: product.priceHC * HUNTER_COIN_PRICE })}>Mua <span>→</span></button>
    </article>
  );
}

export default function Storefront() {
  const [mode, setMode] = useState<CatalogMode>("direct");
  const [filter, setFilter] = useState<Filter>("all");
  const [showAll, setShowAll] = useState(false);
  const [checkout, setCheckout] = useState<CheckoutSelection | null>(null);

  const filteredDirect = useMemo(() => directSkins.filter((skin) => filter === "all" || skin.collection === filter), [filter]);
  const visibleDirect = showAll ? filteredDirect : filteredDirect.slice(0, 12);
  const visibleGacha = showAll ? gachaSkins : gachaSkins.slice(0, 12);
  const gachaOrder: CheckoutSelection = { code: "skin-gacha-10", title: "10 chìa Skin Gacha", description: "10 lượt mở hòm skin", amountVnd: 12 * HUNTER_COIN_PRICE };

  return (
    <main id="top">
      <SiteHeader />
      <section className="hero section-shell">
        <div className="hero-copy">
          <p className="kicker">SVFrame Network · Cobblemon</p>
          <h1>Skin, vật phẩm<br /><span>và Hunter Coin.</span></h1>
          <p className="hero-lead">Chọn món cần mua, nhập tên Minecraft rồi quét đúng mã QR. Giá và phần thưởng hiển thị ngay trên từng sản phẩm.</p>
          <div className="hero-actions"><a className="primary-button" href="#skins">Xem skin <span>→</span></a><a className="secondary-button" href="#shop">Xem vật phẩm</a></div>
          <div className="hero-stats"><div><b>24</b><span>skin mua trực tiếp</span></div><div><b>29</b><span>skin trong hòm Gacha</span></div><div><b>25.000₫</b><span>mỗi Hunter Coin</span></div></div>
        </div>
        <div className="hero-gallery" aria-label="Skin nổi bật">
          <article className="hero-card hero-card-main"><SkinRender path="/skin-renders/zygarde-gundam.png" alt="Zygarde Gundam Freedom" /><div><small>12 HC · Zygarde</small><strong>Gundam Freedom</strong></div></article>
          <article className="hero-card hero-card-left"><SkinRender path="/skin-renders/palkia-the-long-quiet.png" alt="Palkia The Long Quiet" /><span>The Long Quiet</span></article>
          <article className="hero-card hero-card-right"><SkinRender path="/skin-renders/rayquaza-xa-than.png" alt="Rayquaza Xà Thần" /><span>Xà Thần</span></article>
        </div>
      </section>
      <section className="quick-links"><div className="section-shell quick-links-grid"><div><span>IP chính</span><strong>poke.sv-frame.com</strong></div><Link href="/huong-dan"><span>Bộ mod</span><strong>Full & Lite</strong></Link><Link href="/wiki"><span>Wiki</span><strong>Tra cứu spawn</strong></Link><a href="#topup"><span>Nạp</span><strong>Hunter Coin</strong></a></div></section>
      <section id="skins" className="content-section section-shell">
        <div className="section-head"><div><p className="kicker">Skin Pokémon</p><h2>Chọn skin bạn cần.</h2></div><p>Skin mua trực tiếp có giá riêng. Skin Gacha chỉ nhận qua chìa Skin Gacha.</p></div>
        <div className="catalog-switch" role="group" aria-label="Chọn loại skin"><button type="button" className={mode === "direct" ? "active" : ""} onClick={() => { setMode("direct"); setShowAll(false); }}>Mua trực tiếp · 24</button><button type="button" className={mode === "gacha" ? "active" : ""} onClick={() => { setMode("gacha"); setShowAll(false); }}>Skin Gacha · 29</button></div>
        {mode === "direct" ? <><div className="filter-row" role="group" aria-label="Lọc skin">{(Object.keys(filterLabels) as Filter[]).map((key) => <button type="button" key={key} className={filter === key ? "active" : ""} onClick={() => { setFilter(key); setShowAll(false); }}>{filterLabels[key]}</button>)}</div><div className="skin-grid">{visibleDirect.map((skin) => <DirectSkinCard key={skin.id} skin={skin} onBuy={setCheckout} />)}</div>{filteredDirect.length > 12 && <button type="button" className="show-more" onClick={() => setShowAll((value) => !value)}>{showAll ? "Thu gọn" : `Xem đủ ${filteredDirect.length} skin`}</button>}</> : <><div className="gacha-callout"><div><p className="kicker">Skin Gacha</p><h3>10 chìa · 12 HC</h3><p>Các skin bên dưới là phần thưởng có thể nhận từ hòm.</p></div><button type="button" className="primary-button" onClick={() => setCheckout(gachaOrder)}>Mua 10 chìa <span>→</span></button></div><div className="skin-grid gacha-grid">{visibleGacha.map((skin) => <article className="skin-card" key={skin.id}><div className="skin-image"><SkinRender path={skin.image} alt={`${skin.pokemon} — ${skin.name}`} /></div><div className="skin-info compact"><div><small>{skin.pokemon}</small><h3>{skin.name}</h3></div><button type="button" onClick={() => setCheckout(gachaOrder)}>Mua chìa</button></div></article>)}</div>{gachaSkins.length > 12 && <button type="button" className="show-more" onClick={() => setShowAll((value) => !value)}>{showAll ? "Thu gọn" : `Xem đủ ${gachaSkins.length} skin`}</button>}</>}
      </section>
      <section id="shop" className="content-section section-shell">
        <div className="section-head"><div><p className="kicker">Vật phẩm</p><h2>Mua thẳng trên web.</h2></div><p>Chìa khóa, vật phẩm luyện Pokémon và các món tiện ích đang bán trong server.</p></div>
        <div className="bundle-grid">{shopProducts.map((product) => <ProductCard key={product.code} product={product} onBuy={setCheckout} />)}</div>
      </section>
      <section id="topup" className="topup-section"><div className="section-shell"><div className="section-head light-head"><div><p className="kicker">Hunter Coin</p><h2>25.000₫ = 1 HC.</h2></div><p>Chọn số lượng cần nạp rồi quét QR.</p></div><div className="topup-grid">{topupPacks.map((pack) => <article className="topup-card" key={pack.code}><span>Hunter Coin</span><strong>{pack.hunterCoin} HC</strong><b>{formatVnd(pack.priceVnd)}</b><button type="button" onClick={() => setCheckout({ code: pack.code, title: `${pack.hunterCoin} Hunter Coin`, description: `Nạp ${pack.hunterCoin} HC`, amountVnd: pack.priceVnd })}>Nạp</button></article>)}</div></div></section>
      <section id="milestones" className="milestone-section"><div className="section-shell"><div className="section-head light-head"><div><p className="kicker">Tích tiêu</p><h2>Quà theo tổng HC đã dùng.</h2></div><p>Tiến độ được tính theo số Hunter Coin đã chi tại shop.</p></div><div className="milestone-grid">{spendMilestones.map((milestone) => <article className="milestone-card" key={milestone.amountHC}><div><b>{milestone.amountHC}</b><span>HC đã dùng</span></div><h3>{milestone.title}</h3><ul>{milestone.rewards.map((reward) => <li key={reward}>{reward}</li>)}</ul></article>)}</div></div></section>
      <footer><div className="section-shell footer-grid"><Brand /><p>Shop và Wiki của SVFrame Network.</p><div><Link href="/#skins">Skin</Link><Link href="/#shop">Vật phẩm</Link><Link href="/wiki">Wiki</Link></div><span>© {new Date().getFullYear()} SVFrame Network</span></div></footer>
      {checkout && <CheckoutModal selection={checkout} onClose={() => setCheckout(null)} />}
    </main>
  );
}
