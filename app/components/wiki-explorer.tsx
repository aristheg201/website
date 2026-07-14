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

type SpawnPokemon = { key: string; name: string; variants: SpawnVariant[] };
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

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function variantLocations(variant: SpawnVariant) {
  const labels = [...variant.biomeLabels, ...variant.structureLabels];
  if (!labels.length && variant.presets.length) return variant.presets.map((preset) => preset.replaceAll("_", " "));
  return labels.length ? labels : ["Không giới hạn biome"];
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function iconKey(value: string) {
  return normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function PokemonIcon({ pokemon, large = false }: { pokemon: SpawnPokemon; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  const slug = iconKey(pokemon.key || pokemon.name);
  const size = large ? 170 : 64;
  if (failed) return <span className={`pokemon-icon-fallback ${large ? "large" : ""}`}>?</span>;
  return (
    <span className={`pokemon-icon ${large ? "large" : ""}`}>
      <img
        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${slug}.png`}
        alt={pokemon.name}
        width={size}
        height={size}
        loading="lazy"
        onError={(event) => {
          const image = event.currentTarget;
          if (!image.dataset.fallback) {
            image.dataset.fallback = "1";
            image.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${slug}.png`;
          } else {
            setFailed(true);
          }
        }}
      />
    </span>
  );
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
      .then((spawnData) => setData(spawnData))
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
        const details = normalize([...variant.biomeLabels, ...variant.biomes, ...variant.structureLabels, ...variant.structures, ...variant.presets, ...variant.notes].join(" "));
        return details.includes(needle);
      });
      return variants.length ? [{ ...pokemon, variants }] : [];
    });
  }, [data, location, query, rarity, time]);

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const featured = data?.pokemon.find((item) => iconKey(item.name) === "jirachi") ?? data?.pokemon[0];

  return (
    <main className="subpage wiki-page">
      <SiteHeader ctaHref="/huong-dan" ctaLabel="Tải mod" />

      <section className="subpage-hero wiki-hero section-shell">
        <div>
          <p className="kicker">Wiki spawn Pokémon</p>
          <h1>Tìm đúng Pokémon.<br /><span>Đến đúng biome.</span></h1>
          <p>Tra theo tên, biome, khung giờ và độ hiếm. Mỗi thẻ đều có hình Pokémon để nhận diện nhanh thay vì chỉ có chữ.</p>
          <div className="wiki-hero-stats">
            <div><b>{data?.stats.pokemon ?? "—"}</b><span>Pokémon có dữ liệu</span></div>
            <div><b>{data?.stats.spawnConditions.toLocaleString("vi-VN") ?? "—"}</b><span>điều kiện spawn</span></div>
            <div><b>{data?.stats.locations ?? "—"}</b><span>biome / nhóm biome</span></div>
          </div>
        </div>
        <div className="wiki-hero-art">
          {featured && <PokemonIcon pokemon={featured} large />}
          <div><small>Ví dụ tra cứu</small><strong>{featured?.name ?? "Pokémon"}</strong><span>Biome · cấp độ · khung giờ · độ hiếm</span></div>
        </div>
      </section>

      <section className="wiki-explorer section-shell" aria-labelledby="wiki-results-title">
        <div className="wiki-controls">
          <label className="wiki-search"><span>Tìm Pokémon hoặc biome</span><input value={query} onChange={(event) => { setQuery(event.target.value); resetResults(); }} placeholder="Ví dụ: Jirachi, rừng, sa mạc…" /></label>
          <label><span>Biome</span><select value={location} onChange={(event) => { setLocation(event.target.value); resetResults(); }}><option value="all">Tất cả biome</option>{data?.locations.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          <label><span>Khung giờ</span><select value={time} onChange={(event) => { setTime(event.target.value); resetResults(); }}><option value="all">Mọi lúc</option><option value="day">Ban ngày</option><option value="night">Ban đêm</option><option value="dusk">Hoàng hôn</option></select></label>
        </div>

        <div className="rarity-filter" role="group" aria-label="Lọc độ hiếm">
          {[{ id: "all", label: "Tất cả" }, { id: "common", label: "Phổ biến" }, { id: "uncommon", label: "Ít gặp" }, { id: "rare", label: "Hiếm" }, { id: "ultra-rare", label: "Cực hiếm" }].map((item) => <button type="button" key={item.id} className={rarity === item.id ? "active" : ""} onClick={() => { setRarity(item.id); resetResults(); }}>{item.label}</button>)}
        </div>

        <div className="wiki-result-head">
          <div><p className="kicker">Kết quả</p><h2 id="wiki-results-title">{data ? `${filtered.length.toLocaleString("vi-VN")} Pokémon` : "Đang đọc dữ liệu…"}</h2></div>
          {(query || location !== "all" || rarity !== "all" || time !== "all") && <button type="button" onClick={() => { setQuery(""); setLocation("all"); setRarity("all"); setTime("all"); resetResults(); }}>Xóa bộ lọc</button>}
        </div>

        {loadError ? (
          <div className="wiki-empty"><strong>Chưa đọc được dữ liệu Wiki.</strong><span>Hãy tải lại trang sau ít phút.</span></div>
        ) : !data ? (
          <div className="wiki-loading"><i /><span>Đang nạp dữ liệu spawn và hình Pokémon…</span></div>
        ) : filtered.length === 0 ? (
          <div className="wiki-empty"><strong>Không tìm thấy kết quả.</strong><span>Thử bỏ bớt bộ lọc hoặc dùng tên biome rộng hơn.</span></div>
        ) : (
          <div className="wiki-card-grid">
            {visible.map((pokemon) => {
              const locations = unique(pokemon.variants.flatMap(variantLocations));
              const rarities = unique(pokemon.variants.map((variant) => variant.rarityLabel));
              const isOpen = expanded === pokemon.key;
              return (
                <article className={`wiki-card ${isOpen ? "open" : ""}`} key={pokemon.key}>
                  <button type="button" className="wiki-card-summary" onClick={() => setExpanded(isOpen ? null : pokemon.key)} aria-expanded={isOpen}>
                    <PokemonIcon pokemon={pokemon} />
                    <div><small>Pokémon</small><h3>{pokemon.name}</h3><p>{pokemon.variants.length} điều kiện · {rarities.join(" / ")}</p></div>
                    <i>{isOpen ? "−" : "+"}</i>
                  </button>
                  <div className="wiki-location-chips">{locations.slice(0, 4).map((item) => <span key={item}>{item}</span>)}{locations.length > 4 && <span>+{locations.length - 4}</span>}</div>
                  {isOpen && (
                    <div className="spawn-variants">
                      {pokemon.variants.map((variant) => (
                        <div className="spawn-row" key={`${variant.source}-${variant.id}`}>
                          <div className="spawn-location"><small>Biome / khu vực</small><strong>{variantLocations(variant).join(" · ")}</strong>{variant.notes.length > 0 && <span>{variant.notes.join(" · ")}</span>}</div>
                          <dl><div><dt>Cấp</dt><dd>{variant.level}</dd></div><div><dt>Giờ</dt><dd>{variant.timeLabel}</dd></div><div><dt>Độ hiếm</dt><dd>{variant.rarityLabel}</dd></div><div><dt>Vị trí</dt><dd>{variant.contextLabel}</dd></div></dl>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {visible.length < filtered.length && <button type="button" className="show-more" onClick={() => setPage((value) => value + 1)}>Xem thêm {Math.min(PAGE_SIZE, filtered.length - visible.length)} Pokémon</button>}
        <div className="wiki-data-note"><strong>Cách đọc</strong><p>Một Pokémon có thể thỏa nhiều nhóm biome cùng lúc. Hãy mở từng thẻ để kiểm tra cấp độ, thời gian, độ hiếm và vị trí spawn cụ thể.</p></div>
      </section>

      <footer><div className="section-shell footer-grid"><Brand /><p>Wiki spawn của Hunter Network.</p><div><Link href="/">Shop</Link><Link href="/huong-dan">Tải mod</Link><a href="#wiki-results-title">Tra cứu</a></div><span>Dữ liệu pack server</span></div></footer>
    </main>
  );
}
