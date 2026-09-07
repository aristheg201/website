"use client";

import { useEffect, useMemo, useState } from "react";
import { DesktopPortalNav, MobilePortalHeader, MobilePortalNav } from "./portal-shell";

type SpawnType = "normal" | "herd" | "alpha-herd";
type SpawnVariant = {
  id: string; biomes: string[]; biomeLabels: string[]; structures: string[]; structureLabels: string[];
  level: string; rarity: string; rarityLabel: string; time: string; timeLabel: string; context: string; contextLabel: string;
  presets: string[]; notes: string[]; source: string; sourceLabel?: string; pokemonQuery?: string;
  spawnType?: SpawnType; weight?: number; memberWeight?: number;
};
type DexPokemon = {
  key: string; species?: string; name: string; baseName?: string; kind?: "pokemon" | "fakemon" | "addon-form";
  sourceLabel?: string; variants: SpawnVariant[];
};
type DexFile = {
  stats?: { pokemon: number; spawnConditions: number; locations: number; fakemon?: number; addonForms?: number };
  locations?: Array<{ id: string; label: string }>; pokemon: DexPokemon[];
};
type AddonChunk={s:string;p:Array<[string,string,"f"|"a",Array<[string[],string[],string,string,string,string,string[],string]>]>};
type PatchVariant={id:string;b:string[];bl:string[];s:string[];sl:string[];l:string;r:string;t:string;c:string;p:string[];n:string[];q?:string;w?:number;mw?:number;st?:SpawnType};
type PatchPokemon={k:string;name:string;v:PatchVariant[]};
type OfficialPatch={version:string;replace?:PatchPokemon[];append?:PatchPokemon[]};
type KindFilter = "all" | "pokemon" | "fakemon" | "addon-form";
type SpawnTypeFilter = "all" | SpawnType;

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/website";
const PAGE_SIZE = 30;

function normalize(value: string){return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();}
function uniq<T>(values:T[]){return [...new Set(values)];}
function humanizeId(value:string){let s=value.replace(/^#/,"");if(s.includes(":"))s=s.split(":")[1];s=s.replace(/^is_/,"");return s.split(/[\/_-]+/).filter(Boolean).map(x=>x.charAt(0).toUpperCase()+x.slice(1)).join(" ");}
function locationLabels(v:SpawnVariant){const x=[...v.biomeLabels,...v.structureLabels];return x.length?x:(v.presets?.length?v.presets.map(s=>s.replaceAll("_"," ")):["Không giới hạn biome"]);}
function rarityLabel(value:string){return ({common:"Phổ biến",uncommon:"Ít gặp",rare:"Hiếm","ultra-rare":"Cực hiếm",boss:"Boss / Alpha"} as Record<string,string>)[value]||humanizeId(value);}
function timeLabel(value:string){return ({day:"Ban ngày",night:"Ban đêm",dusk:"Hoàng hôn",dawn:"Bình minh",any:"Mọi lúc"} as Record<string,string>)[value]||humanizeId(value);}
function contextLabel(value:string){return ({grounded:"Trên mặt đất",submerged:"Dưới nước",fishing:"Câu cá",natural:"Tự nhiên",surface:"Trên bề mặt",seafloor:"Đáy biển"} as Record<string,string>)[value]||humanizeId(value);}
function spawnTypeLabel(value:SpawnType|undefined){return value==="alpha-herd"?"Alpha Herd":value==="herd"?"Herd":"Spawn thường";}
function expandAddonChunk(chunk:AddonChunk):DexPokemon[]{return chunk.p.map(([key,name,kind,variants])=>({key,name,kind:kind==="f"?"fakemon":"addon-form",sourceLabel:chunk.s,variants:variants.map(([biomes,structures,level,rarity,time,context,presets,notes],i)=>({id:`${key}-${i}`,biomes,biomeLabels:biomes.map(humanizeId),structures,structureLabels:structures.map(humanizeId),level,rarity,rarityLabel:rarityLabel(rarity),time,timeLabel:timeLabel(time),context,contextLabel:contextLabel(context),presets,notes:notes?notes.split("|").filter(Boolean):[],source:chunk.s,sourceLabel:chunk.s,spawnType:"normal"}))}));}
function expandPatchPokemon(p:PatchPokemon):DexPokemon{return {key:p.k,name:p.name,kind:"pokemon",sourceLabel:"Cobblemon 1.8.0",variants:p.v.map(v=>({id:v.id,biomes:v.b||[],biomeLabels:v.bl||[],structures:v.s||[],structureLabels:v.sl||[],level:v.l||"—",rarity:v.r||"common",rarityLabel:rarityLabel(v.r||"common"),time:v.t||"any",timeLabel:timeLabel(v.t||"any"),context:v.c||"natural",contextLabel:contextLabel(v.c||"natural"),presets:v.p||[],notes:v.n||[],source:"Cobblemon 1.8.0",sourceLabel:"Cobblemon 1.8.0",pokemonQuery:v.q,spawnType:v.st||"normal",weight:v.w,memberWeight:v.mw}))};}

async function loadGzipJson(url:string):Promise<DexFile>{
  const r=await fetch(url); if(!r.ok)throw new Error("base dex unavailable");
  const compressed=await r.arrayBuffer();
  const stream=new Blob([compressed]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Response(stream).json() as Promise<DexFile>;
}
async function loadBase64GzipJson(url:string):Promise<OfficialPatch>{
  const r=await fetch(url); if(!r.ok)throw new Error("Cobblemon 1.8 patch unavailable");
  const encoded=(await r.text()).replace(/\s+/g,"");
  const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
  const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Response(stream).json() as Promise<OfficialPatch>;
}

function sourceName(p:DexPokemon,v?:SpawnVariant){return v?.sourceLabel || p.sourceLabel || (p.kind==="pokemon"?"Server Pack":"Server Addon");}
function kindLabel(k:DexPokemon["kind"]){return k==="fakemon"?"FAKEMON":k==="addon-form"?"CUSTOM FORM":"POKÉMON";}

function useDex(){
  const [rows,setRows]=useState<DexPokemon[]>([]); const [locations,setLocations]=useState<Array<{id:string;label:string}>>([]); const [error,setError]=useState(false);
  useEffect(()=>{
    const addonChunks=["lively-1","lively-2","lively-3","lively-4","lively-5","fai-1","fai-2","eldoria-1"];
    const herdChunks=Array.from({length:8},(_,i)=>`herds-${i+1}`);
    Promise.all([
      loadGzipJson(`${BASE_PATH}/data/spawns.json.gz`),
      loadBase64GzipJson(`${BASE_PATH}/data/cobblemon18/normal-delta.b64`),
      ...herdChunks.map(name=>loadBase64GzipJson(`${BASE_PATH}/data/cobblemon18/${name}.b64`)),
      ...addonChunks.map(name=>fetch(`${BASE_PATH}/data/fakemon/${name}.json`).then(r=>{if(!r.ok)throw new Error("addon dex unavailable");return r.json() as Promise<AddonChunk>;}))
    ]).then(values=>{
      const base=values[0] as DexFile;
      const normalPatch=values[1] as OfficialPatch;
      const herdPatches=values.slice(2,10) as OfficialPatch[];
      const addonData=values.slice(10) as AddonChunk[];
      const byKey=new Map<string,DexPokemon>();
      base.pokemon.forEach(p=>byKey.set(p.key,{...p,kind:"pokemon",sourceLabel:p.sourceLabel||"Server Pack",variants:p.variants.map(v=>({...v,spawnType:v.spawnType||"normal"}))}));
      (normalPatch.replace||[]).forEach(p=>byKey.set(p.k,expandPatchPokemon(p)));
      herdPatches.flatMap(p=>p.append||[]).forEach(p=>{
        const extra=expandPatchPokemon(p);
        const current=byKey.get(p.k);
        if(current)byKey.set(p.k,{...current,name:extra.name||current.name,variants:[...current.variants,...extra.variants]});
        else byKey.set(p.k,extra);
      });
      const official=[...byKey.values()];
      const addons=addonData.flatMap(expandAddonChunk);
      const finalRows=[...official,...addons];
      setRows(finalRows);
      const map=new Map<string,string>(); (base.locations||[]).forEach(x=>map.set(x.id,x.label));
      finalRows.flatMap(p=>p.variants).forEach(v=>{v.biomes.forEach((id,i)=>map.set(id,v.biomeLabels[i]||humanizeId(id)));v.structures.forEach((id,i)=>map.set(id,v.structureLabels[i]||humanizeId(id)));});
      setLocations([...map].map(([id,label])=>({id,label})).sort((a,b)=>a.label.localeCompare(b.label,"vi")));
    }).catch(()=>setError(true));
  },[]);
  return {rows,locations,error};
}

function VariantDetail({pokemon}:{pokemon:DexPokemon}){
  return <div className="dex-variant-list">{pokemon.variants.map((v,i)=><article className="dex-variant" key={`${v.source}-${v.id}-${i}`}>
    <div className="dex-variant-title"><div><small>{sourceName(pokemon,v)} · {spawnTypeLabel(v.spawnType)}</small><strong>{locationLabels(v).join(" · ")}</strong></div><span>{v.rarityLabel}</span></div>
    <dl><div><dt>Level</dt><dd>{v.level}</dd></div><div><dt>Thời gian</dt><dd>{v.timeLabel}</dd></div><div><dt>Vị trí</dt><dd>{v.contextLabel}</dd></div><div><dt>Preset</dt><dd>{v.presets?.length?v.presets.join(", "):"—"}</dd></div></dl>
    {(v.weight!==undefined||v.memberWeight!==undefined||!!v.notes?.length)&&<div className="dex-condition-lines">{v.weight!==undefined&&<span>weight: {v.weight}</span>}{v.memberWeight!==undefined&&<span>herd member weight: {v.memberWeight}</span>}{v.notes.map((n,j)=><span key={j}>{n}</span>)}</div>}
  </article>)}</div>;
}

export default function WorldDex(){
  const {rows,locations,error}=useDex(); const [q,setQ]=useState("");const [kind,setKind]=useState<KindFilter>("all");const [location,setLocation]=useState("all");const [time,setTime]=useState("all");const [rarity,setRarity]=useState("all");const [spawnType,setSpawnType]=useState<SpawnTypeFilter>("all");const [open,setOpen]=useState<string|null>(null);const [page,setPage]=useState(1);
  const filtered=useMemo(()=>rows.flatMap(p=>{
    if(kind!=="all"&&p.kind!==kind)return [];
    const needle=normalize(q.trim()); const nameMatch=!needle||normalize(`${p.name} ${p.baseName||""} ${p.species||""} ${p.key}`).includes(needle);
    const variants=p.variants.filter(v=>{
      if(location!=="all"&&!v.biomes.includes(location)&&!v.structures.includes(location))return false;
      if(time!=="all"&&v.time!==time)return false;
      if(rarity!=="all"&&v.rarity!==rarity)return false;
      if(spawnType!=="all"&&(v.spawnType||"normal")!==spawnType)return false;
      if(nameMatch)return true;
      return normalize([...v.biomeLabels,...v.structureLabels,...v.notes,sourceName(p,v),spawnTypeLabel(v.spawnType),v.pokemonQuery||""].join(" ")).includes(needle);
    });
    return variants.length?[{...p,variants}]:[];
  }),[rows,q,kind,location,time,rarity,spawnType]);
  const visible=filtered.slice(0,page*PAGE_SIZE);
  const resetPage=()=>{setPage(1);setOpen(null)};
  const resetFilters=()=>{setQ("");setKind("all");setLocation("all");setTime("all");setRarity("all");setSpawnType("all");resetPage();};
  const counts={all:rows.length,pokemon:rows.filter(x=>x.kind==="pokemon").length,fakemon:rows.filter(x=>x.kind==="fakemon").length,"addon-form":rows.filter(x=>x.kind==="addon-form").length};

  const controls=<>
    <label className="dex-search"><span>Tìm tên / biome / condition</span><input value={q} onChange={e=>{setQ(e.target.value);resetPage()}} placeholder="Miraidon, Anglerine, alpha, deep ocean…"/></label>
    <label><span>Biome / structure</span><select value={location} onChange={e=>{setLocation(e.target.value);resetPage()}}><option value="all">Tất cả khu vực</option>{locations.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
    <label><span>Thời gian</span><select value={time} onChange={e=>{setTime(e.target.value);resetPage()}}><option value="all">Mọi lúc</option><option value="day">Ban ngày</option><option value="night">Ban đêm</option><option value="dusk">Hoàng hôn</option><option value="dawn">Bình minh</option></select></label>
  </>;

  const filters=<><div className="dex-kind-tabs">{([
    ["all","Tất cả"],["pokemon","Pokémon"],["fakemon","Fakemon"],["addon-form","Custom forms"]
  ] as [KindFilter,string][]).map(([id,label])=><button key={id} className={kind===id?"active":""} onClick={()=>{setKind(id);resetPage()}}>{label}<b>{counts[id]}</b></button>)}</div>
  <div className="dex-rarity-tabs">{([[
    "all","Mọi spawn"],["normal","Spawn thường"],["herd","Herd"],["alpha-herd","Alpha Herd"]
  ] as [SpawnTypeFilter,string][]).map(([id,label])=><button key={id} className={spawnType===id?"active":""} onClick={()=>{setSpawnType(id);resetPage()}}>{label}</button>)}</div>
  <div className="dex-rarity-tabs">{[["all","Mọi độ hiếm"],["common","Phổ biến"],["uncommon","Ít gặp"],["rare","Hiếm"],["ultra-rare","Cực hiếm"],["boss","Boss / Alpha"]].map(([id,label])=><button key={id} className={rarity===id?"active":""} onClick={()=>{setRarity(id);resetPage()}}>{label}</button>)}</div></>;

  const card=(p:DexPokemon,index:number)=>{const id=`${p.key}-${index}`;const isOpen=open===id;const loc=uniq(p.variants.flatMap(locationLabels));const modes=uniq(p.variants.map(v=>spawnTypeLabel(v.spawnType)));return <article className={`dex-result-card ${isOpen?"open":""}`} key={id}>
    <button className="dex-card-head" type="button" onClick={()=>setOpen(isOpen?null:id)}>
      <span className={`dex-kind-badge ${p.kind}`}>{kindLabel(p.kind)}</span>
      <div><small>{p.sourceLabel||"Server Pack"}</small><h3>{p.name}</h3><p>{p.variants.length} condition · {modes.join(" / ")} · {loc.slice(0,2).join(" · ")}{loc.length>2?` +${loc.length-2}`:""}</p></div>
      <b>{isOpen?"−":"+"}</b>
    </button>
    {isOpen&&<VariantDetail pokemon={p}/>} </article>};

  const hasFilter=q||kind!=="all"||location!=="all"||time!=="all"||rarity!=="all"||spawnType!=="all";
  return <>
    <div className="portal-desktop desktop-only"><DesktopPortalNav active="dex"/><main className="portal-main dex-main">
      <section className="dex-desktop-head"><div><div className="portal-eyebrow">WORLD DEX · COBBLEMON 1.8 + SERVER DATA</div><h1>Biết chính xác.<br/><span>Spawn ở đâu.</span></h1><p>Tra Pokémon, Fakemon và custom form trên SVFrame. Dữ liệu native đã cập nhật lên Cobblemon 1.8, bao gồm spawn thường, Herd và Alpha Herd.</p></div><div className="dex-stat-stack"><div><b>{rows.length||"—"}</b><span>entries</span></div><div><b>{rows.reduce((n,p)=>n+p.variants.length,0)||"—"}</b><span>conditions</span></div><div><b>{counts.fakemon||"—"}</b><span>fakemon</span></div></div></section>
      <section className="dex-desktop-controls"><div className="dex-control-grid">{controls}</div>{filters}</section>
      <section className="dex-results"><div className="dex-result-title"><div><small>KẾT QUẢ</small><h2>{rows.length?`${filtered.length} entries`:"Đang nạp dữ liệu…"}</h2></div>{hasFilter&&<button onClick={resetFilters}>Xóa bộ lọc</button>}</div>
      {error?<div className="dex-empty">Không đọc được dữ liệu Dex.</div>:<div className="dex-card-list">{visible.map(card)}</div>}{visible.length<filtered.length&&<button className="dex-more" onClick={()=>setPage(x=>x+1)}>Xem thêm</button>}</section>
    </main></div>

    <div className="portal-mobile mobile-only"><MobilePortalHeader title="World Dex"/><main className="mobile-dex-main">
      <section className="mobile-dex-search"><div><small>COBBLEMON 1.8 · WORLD DEX</small><h1>{rows.length||"—"} entries</h1></div>{controls}</section>
      <div className="mobile-dex-filter-scroll">{filters}</div>
      <section className="mobile-dex-results"><div className="mobile-result-count"><strong>{filtered.length}</strong><span>kết quả</span></div>{error?<div className="dex-empty">Không đọc được dữ liệu Dex.</div>:visible.map(card)}{visible.length<filtered.length&&<button className="dex-more" onClick={()=>setPage(x=>x+1)}>Xem thêm</button>}</section>
    </main><MobilePortalNav active="dex"/></div>
  </>;
}
