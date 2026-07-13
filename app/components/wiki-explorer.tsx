"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Brand, SiteHeader } from "./site-brand";

type SpawnVariant = {
  id: string;
  biomes: string[];
  biomeLabels: string[];
  structures: string[];
  structureLabels: string[];
  level: string;
  rarity: string;
  rarityLabel: string;
  time: string;
  timeLabel: string;
  context: string;
  contextLabel: string;
  presets: string[];
  notes: string[];
  source: string;
};

type SpawnPokemon = {
  key: string;
  name: string;
  variants: SpawnVariant[];
};

type WikiData = {
  generatedFrom: string;
  updatedAt: string;
  stats: { pokemon: number; spawnConditions: number; locations: number };
  sources: string[];
  locations: Array<{ id: string; label: string }>;
  pokemon: SpawnPokemon[];
};

const PAGE_SIZE = 24;
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/website";

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>;
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function variantLocations(variant: SpawnVariant) {
  const labels = [...variant.biomeLabels, ...variant.structureLabels];
  if (!labels.length && variant.presets.length) return variant.presets.map((preset) => preset.replaceAll("_", " "));
  return labels.length ? labels : ["Không giới hạn biome"];
}

export default function WikiExplorer() {
  const [data, setData] = useState<WikiData | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("all");
  const [rarity, setRarity] = useState("all");
  const [time, setTime] = useState("all");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${BASE_PATH}/data/spawns.json.gz`)
      .then((response) => {
        if (!response.ok) throw new Error("Wiki data unavailable");
        return response.arrayBuffer();
      })
      .then(async (compressed) => {
        const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("gzip"));
        return new Response(stream).json() as Promise<WikiData>;
      })
      .then((payload) => setData(payload))
      .catch(() => setLoadError(true));
  }, []);

  function resetResults() {
    setPage(1);
    setExpanded(null);
  }

  const filtered = useMemo(() => {
    if (!data) return [];
    const needle = normalize(query.trim());
    return data.pokemon.flatMap((pokemon) => {
      const pokemonMatch = !needle || normalize(`${pokemon.name} ${pokemon.key}`).includes(needle);
      const variants = pokemon.variants.filter((variant) => {
        if (location !== "all" && !variant.biomes.includes(location)) return false;
        if (rarity !== "all" && variant.rarity !== rarity) return false;
        if (time !== "all" && variant.time !== time) return false;
        if (pokemonMatch) return true;
        const details = normalize([
          ...variant.biomeLabels,
          ...variant.biomes,
          ...variant.structureLabels,
          ...variant.structures,
          ...variant.presets,
          ...variant.notes,
          variant.source,
        ].join(" "));
        return details.includes(needle);
      });
      return variants.length ? [{ ...pokemon, variants }] : [];
    });
  }, [data, location, query, rarity, time]);

  const visible = filtered.slice(0, page * PAGE_SIZE);

  return (
    <main className="subpage wiki-page">
      <div className="site-noise" />
      <SiteHeader ctaHref="/huong-dan" ctaLabel="TẢI MOD" />

      <section className="subpage-hero wiki-hero section-shell">
        <div>
          <span className="eyebrow"><i /> WIKI SPAWN / DỮ LIỆU TỪ PACK SERVER</span>
          <h1>CON NÀO.<br /><em>Ở ĐÂU.</em></h1>
          <p>Gõ tên Pokémon hoặc chọn biome. Wiki trả đúng điều kiện spawn trong Cobblemon 1.7.3, Baby Legends và allthemon đang có trong bộ server bạn gửi.</p>
        </div>
        <div className="wiki-hero-stats">
          <div><b>{data?.stats.pokemon ?? "—"}</b><span>Pokémon có dữ liệu</span></div>
          <div><b>{data?.stats.spawnConditions.toLocaleString("vi-VN") ?? "—"}</b><span>điều kiện spawn</span></div>
          <div><b>{data?.stats.locations ?? "—"}</b><span>biome / nhóm biome</span></div>
        </div>
      </section>

      <section className="wiki-explorer section-shell" aria-labelledby="wiki-results-title">
        <div className="wiki-controls">
          <label className="wiki-search">
            <span>Tìm Pokémon hoặc biome</span>
            <div><SearchIcon /><input value={query} onChange={(event) => { setQuery(event.target.value); resetResults(); }} placeholder="VD: Jirachi, rừng, sa mạc, Nether…" /></div>
          </label>
          <label><span>Biome</span><select value={location} onChange={(event) => { setLocation(event.target.value); resetResults(); }}><option value="all">Tất cả biome</option>{data?.locations.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          <label><span>Khung giờ</span><select value={time} onChange={(event) => { setTime(event.target.value); resetResults(); }}><option value="all">Mọi lúc</option><option value="day">Ban ngày</option><option value="night">Ban đêm</option><option value="dusk">Hoàng hôn</option></select></label>
        </div>

        <div className="rarity-filter" role="group" aria-label="Lọc độ hiếm">
          {[{ id: "all", label: "Tất cả" }, { id: "common", label: "Phổ biến" }, { id: "uncommon", label: "Ít gặp" }, { id: "rare", label: "Hiếm" }, { id: "ultra-rare", label: "Cực hiếm" }].map((item) => <button key={item.id} className={rarity === item.id ? "active" : ""} onClick={() => { setRarity(item.id); resetResults(); }}>{item.label}</button>)}
        </div>

        <div className="wiki-result-head">
          <div><span className="eyebrow">KẾT QUẢ</span><h2 id="wiki-results-title">{data ? `${filtered.length.toLocaleString("vi-VN")} POKÉMON` : "ĐANG ĐỌC DATAPACK…"}</h2></div>
          {(query || location !== "all" || rarity !== "all" || time !== "all") && <button onClick={() => { setQuery(""); setLocation("all"); setRarity("all"); setTime("all"); resetResults(); }}>XÓA BỘ LỌC</button>}
        </div>

        {loadError ? (
          <div className="wiki-empty"><strong>Chưa đọc được dữ liệu Wiki.</strong><span>Thử tải lại trang sau ít phút.</span></div>
        ) : !data ? (
          <div className="wiki-loading"><i /><span>Đang nạp 2.973 điều kiện spawn…</span></div>
        ) : filtered.length === 0 ? (
          <div className="wiki-empty"><strong>Không thấy Pokémon nào khớp.</strong><span>Thử bỏ bớt bộ lọc hoặc tìm bằng tên biome rộng hơn.</span></div>
        ) : (
          <div className="wiki-card-grid">
            {visible.map((pokemon, index) => {
              const locations = unique(pokemon.variants.flatMap(variantLocations));
              const rarities = unique(pokemon.variants.map((variant) => variant.rarityLabel));
              const sources = unique(pokemon.variants.map((variant) => variant.source));
              const isOpen = expanded === pokemon.key;
              return (
                <article className={`wiki-card ${isOpen ? "open" : ""}`} key={pokemon.key}>
                  <button className="wiki-card-summary" onClick={() => setExpanded(isOpen ? null : pokemon.key)} aria-expanded={isOpen}>
                    <span className="wiki-index">#{String(index + 1).padStart(3, "0")}</span>
                    <div><small>{sources.join(" · ")}</small><h3>{pokemon.name}</h3><p>{pokemon.variants.length} điều kiện · {rarities.join(" / ")}</p></div>
                    <i>{isOpen ? "−" : "+"}</i>
                  </button>
                  <div className="wiki-location-chips">{locations.slice(0, 5).map((item) => <span key={item}>{item}</span>)}{locations.length > 5 && <span>+{locations.length - 5}</span>}</div>
                  {isOpen && (
                    <div className="spawn-variants">
                      {pokemon.variants.map((variant) => (
                        <div className="spawn-row" key={`${variant.source}-${variant.id}`}>
                          <div className="spawn-location"><small>BIOME / KHU VỰC</small><strong>{variantLocations(variant).join(" · ")}</strong>{variant.notes.length > 0 && <span>{variant.notes.join(" · ")}</span>}</div>
                          <dl>
                            <div><dt>Cấp</dt><dd>{variant.level}</dd></div>
                            <div><dt>Giờ</dt><dd>{variant.timeLabel}</dd></div>
                            <div><dt>Độ hiếm</dt><dd>{variant.rarityLabel}</dd></div>
                            <div><dt>Vị trí</dt><dd>{variant.contextLabel}</dd></div>
                          </dl>
                          <small className="spawn-source">Nguồn: {variant.source}</small>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {visible.length < filtered.length && <button className="show-more" onClick={() => setPage((value) => value + 1)}>XEM THÊM {Math.min(PAGE_SIZE, filtered.length - visible.length)} POKÉMON <span>+</span></button>}

        <div className="wiki-data-note">
          <span>ĐỌC CHO ĐÚNG</span>
          <p>Các nhãn như “Rừng”, “Núi” hay “Ôn đới” là nhóm biome Cobblemon; một Pokémon có thể thỏa nhiều nhóm cùng lúc. Kết quả còn phụ thuộc cấp độ, thời gian, thời tiết và điều kiện ghi trong từng dòng. Khi datapack server đổi, Wiki cũng cần xuất lại dữ liệu.</p>
        </div>
      </section>

      <footer><div className="section-shell footer-grid"><Brand /><p>Wiki spawn của Hunter Network.<br />Nguồn lấy từ đúng pack server.</p><div><Link href="/">Shop</Link><Link href="/huong-dan">Tải & cài mod</Link><a href="#wiki-results-title">Tra cứu</a></div><span>DATA 29.05.2026</span></div></footer>
    </main>
  );
}
