export type SkinCollection = "liger" | "hero" | "legendary";

export type DirectSkin = {
  id: string;
  pokemon: string;
  name: string;
  aspect: string;
  image: string;
  priceHC: number;
  collection: SkinCollection;
  featured?: boolean;
};

export type GachaSkin = {
  id: string;
  pokemon: string;
  name: string;
  image: string;
  collection: "atelier" | "heroes" | "titans";
};

export const directSkins: DirectSkin[] = [
  { id: "eevee-liger-zero", pokemon: "Eevee", name: "Liger Zero", aspect: "ligerzero", image: "/skin-renders/eevee-liger-zero.png", priceHC: 6, collection: "liger", featured: true },
  { id: "vaporeon-liger", pokemon: "Vaporeon", name: "Liger Vaporeon", aspect: "zoid", image: "/skin-renders/vaporeon-liger.png", priceHC: 6, collection: "liger" },
  { id: "jolteon-liger", pokemon: "Jolteon", name: "Liger Jolteon", aspect: "zoid", image: "/skin-renders/jolteon-liger.png", priceHC: 6, collection: "liger" },
  { id: "flareon-liger", pokemon: "Flareon", name: "Liger Flareon", aspect: "zoid", image: "/skin-renders/flareon-liger.png", priceHC: 6, collection: "liger" },
  { id: "lunala-mega", pokemon: "Lunala", name: "Mega Lunala", aspect: "mega_lunala", image: "/skin-renders/lunala-mega.png", priceHC: 6, collection: "legendary" },
  { id: "lunala-mega-gold", pokemon: "Lunala", name: "Mega Lunala Gold", aspect: "mega_lunala_gold", image: "/skin-renders/lunala-mega-gold.png", priceHC: 10, collection: "legendary", featured: true },
  { id: "solgaleo-mega", pokemon: "Solgaleo", name: "Mega Solgaleo", aspect: "mega_solgaleo", image: "/skin-renders/solgaleo-mega.png", priceHC: 6, collection: "legendary" },
  { id: "solgaleo-mega-gold", pokemon: "Solgaleo", name: "Mega Solgaleo Gold", aspect: "mega_solgaleo_gold", image: "/skin-renders/solgaleo-mega-gold.png", priceHC: 10, collection: "legendary" },
  { id: "mewtwo-mewjo", pokemon: "Mewtwo", name: "Mewjo", aspect: "mewjo", image: "/skin-renders/mewtwo-mewjo.png", priceHC: 6, collection: "hero" },
  { id: "iron-valiant-iron-woman", pokemon: "Iron Valiant", name: "Iron Woman", aspect: "ironwoman", image: "/skin-renders/iron-valiant-iron-woman.png", priceHC: 8, collection: "hero" },
  { id: "buzzwole-superman", pokemon: "Buzzwole", name: "Superman", aspect: "buzzwole_superman", image: "/skin-renders/buzzwole-superman.png", priceHC: 8, collection: "hero" },
  { id: "armarouge-axe", pokemon: "Armarouge", name: "Axe", aspect: "axe", image: "/skin-renders/armarouge-axe.png", priceHC: 10, collection: "hero" },
  { id: "ceruledge-maou", pokemon: "Ceruledge", name: "Maou", aspect: "maou", image: "/skin-renders/ceruledge-maou.png", priceHC: 10, collection: "hero" },
  { id: "ninetales-kurama", pokemon: "Ninetales", name: "Kurama", aspect: "kurama", image: "/skin-renders/ninetales-kurama.png", priceHC: 8, collection: "hero" },
  { id: "arceus-supreme", pokemon: "Arceus", name: "Supreme", aspect: "supreme", image: "/skin-renders/arceus-supreme.png", priceHC: 12, collection: "legendary" },
  { id: "regigigas-regiraga", pokemon: "Regigigas", name: "Regiraga", aspect: "regiraga", image: "/skin-renders/regigigas-regiraga.png", priceHC: 12, collection: "legendary" },
  { id: "ceruledge-sam", pokemon: "Ceruledge", name: "Sam", aspect: "sam", image: "/skin-renders/ceruledge-sam.png", priceHC: 12, collection: "hero" },
  { id: "palkia-the-long-quiet", pokemon: "Palkia", name: "The Long Quiet", aspect: "thelongquiet", image: "/skin-renders/palkia-the-long-quiet.png", priceHC: 10, collection: "legendary", featured: true },
  { id: "rayquaza-xa-than", pokemon: "Rayquaza", name: "Xà Thần", aspect: "rayquaza_xathan", image: "/skin-renders/rayquaza-xa-than.png", priceHC: 10, collection: "legendary", featured: true },
  { id: "zygarde-gundam", pokemon: "Zygarde", name: "Gundam Freedom", aspect: "zg782", image: "/skin-renders/zygarde-gundam.png", priceHC: 12, collection: "legendary", featured: true },
  { id: "volcarona-moonlight", pokemon: "Volcarona", name: "Moonlight", aspect: "moonlight", image: "/skin-renders/volcarona-moonlight.png", priceHC: 10, collection: "legendary" },
  { id: "lucario-batman", pokemon: "Lucario", name: "Batman", aspect: "batman", image: "/skin-renders/lucario-batman.png", priceHC: 12, collection: "hero" },
  { id: "cyclizar-akira", pokemon: "Cyclizar", name: "Akira", aspect: "akira", image: "/skin-renders/cyclizar-akira.png", priceHC: 10, collection: "hero" },
  { id: "gallade-denji", pokemon: "Gallade", name: "Denji", aspect: "denji_gallade", image: "/skin-renders/gallade-denji.png", priceHC: 10, collection: "hero" },
];

export const gachaSkins: GachaSkin[] = [
  { id: "gardevoir-2b", pokemon: "Gardevoir", name: "2B", image: "/skin-renders/gardevoir-2b.png", collection: "atelier" },
  { id: "gardevoir-amy", pokemon: "Gardevoir", name: "Amy", image: "/skin-renders/gardevoir-amy.png", collection: "atelier" },
  { id: "gardevoir-bunny", pokemon: "Gardevoir", name: "Bunny", image: "/skin-renders/gardevoir-bunny.png", collection: "atelier" },
  { id: "gardevoir-fubuki", pokemon: "Gardevoir", name: "Fubuki", image: "/skin-renders/gardevoir-fubuki.png", collection: "atelier" },
  { id: "gardevoir-lune", pokemon: "Gardevoir", name: "Lune", image: "/skin-renders/gardevoir-lune.png", collection: "atelier" },
  { id: "gardevoir-robin", pokemon: "Gardevoir", name: "Robin", image: "/skin-renders/gardevoir-robin.png", collection: "atelier" },
  { id: "gardevoir-apovoir", pokemon: "Gardevoir", name: "Apovoir", image: "/skin-renders/gardevoir-apovoir.png", collection: "atelier" },
  { id: "gardevoir-arbidevoir", pokemon: "Gardevoir", name: "Arbidevoir", image: "/skin-renders/gardevoir-arbidevoir.png", collection: "atelier" },
  { id: "gardevoir-buttervoir", pokemon: "Gardevoir", name: "Buttervoir", image: "/skin-renders/gardevoir-buttervoir.png", collection: "atelier" },
  { id: "gardevoir-censored", pokemon: "Gardevoir", name: "Censored", image: "/skin-renders/gardevoir-censored.png", collection: "atelier" },
  { id: "gardevoir-despairoir", pokemon: "Gardevoir", name: "Despairoir", image: "/skin-renders/gardevoir-despairoir.png", collection: "atelier" },
  { id: "gardevoir-rabbivoir", pokemon: "Gardevoir", name: "Rabbivoir", image: "/skin-renders/gardevoir-rabbivoir.png", collection: "atelier" },
  { id: "indeedee-maid", pokemon: "Indeedee", name: "Maid", image: "/skin-renders/indeedee-maid.png", collection: "atelier" },
  { id: "indeedee-knight", pokemon: "Indeedee", name: "Knight", image: "/skin-renders/indeedee-knight.png", collection: "heroes" },
  { id: "cyclizar-akira", pokemon: "Cyclizar", name: "Akira", image: "/skin-renders/cyclizar-akira.png", collection: "heroes" },
  { id: "lucario-batman", pokemon: "Lucario", name: "Batman", image: "/skin-renders/lucario-batman.png", collection: "heroes" },
  { id: "lucario-hyper-ela", pokemon: "Lucario", name: "Hyper / Ela", image: "/skin-renders/lucario-hyper-ela.png", collection: "heroes" },
  { id: "buzzwole-superman", pokemon: "Buzzwole", name: "Superman", image: "/skin-renders/buzzwole-superman.png", collection: "heroes" },
  { id: "ceruledge-maou", pokemon: "Ceruledge", name: "Maou", image: "/skin-renders/ceruledge-maou.png", collection: "heroes" },
  { id: "armarouge-axe", pokemon: "Armarouge", name: "Axe", image: "/skin-renders/armarouge-axe.png", collection: "heroes" },
  { id: "aerodactyl-rodan", pokemon: "Aerodactyl", name: "Rodan", image: "/skin-renders/aerodactyl-rodan.png", collection: "titans" },
  { id: "charizard-inferno", pokemon: "Charizard", name: "Inferno", image: "/skin-renders/charizard-inferno.png", collection: "titans" },
  { id: "marowak-kidzilla", pokemon: "Marowak", name: "Kidzilla", image: "/skin-renders/marowak-kidzilla.png", collection: "titans" },
  { id: "hydreigon-ghidorah", pokemon: "Hydreigon", name: "King Ghidorah", image: "/skin-renders/hydreigon-ghidorah.png", collection: "titans" },
  { id: "rillaboom-kong", pokemon: "Rillaboom", name: "King Kong", image: "/skin-renders/rillaboom-kong.png", collection: "titans" },
  { id: "tyranitar-godzilla", pokemon: "Tyranitar", name: "Godzilla", image: "/skin-renders/tyranitar-godzilla.png", collection: "titans" },
  { id: "tyrantrum-flora", pokemon: "Tyrantrum", name: "Flora", image: "/skin-renders/tyrantrum-flora.png", collection: "titans" },
  { id: "volcarona-mothra", pokemon: "Volcarona", name: "Mothra", image: "/skin-renders/volcarona-mothra.png", collection: "titans" },
  { id: "zeraora-flash", pokemon: "Zeraora", name: "Flash", image: "/skin-renders/zeraora-flash.png", collection: "heroes" },
];

export type ShopProduct = { code: string; title: string; priceHC: number; rewards: string[] };
export const shopProducts: ShopProduct[] = [
  { code: "starter-key-10", title: "10 chìa Starter", priceHC: 2, rewards: ["10 lượt mở hòm Starter"] },
  { code: "legendary-key-10", title: "10 chìa Legendary", priceHC: 4, rewards: ["10 lượt mở hòm Legendary"] },
  { code: "legendary-shiny-key-10", title: "10 chìa Legendary Shiny", priceHC: 8, rewards: ["10 lượt mở hòm Legendary Shiny"] },
  { code: "skin-gacha-key-10", title: "10 chìa Skin Gacha", priceHC: 12, rewards: ["10 lượt mở hòm Skin Gacha"] },
  { code: "exp-candy-pack", title: "Gói EXP Candy", priceHC: 3, rewards: ["64 EXP Candy XL", "64 EXP Candy L", "64 EXP Candy M", "64 Aprijuice đỏ"] },
  { code: "vitamin-pack", title: "Gói luyện chỉ số", priceHC: 3, rewards: ["64 HP Up", "64 PP Up", "64 Protein", "64 Iron", "64 Calcium", "64 Zinc", "64 Carbos", "64 EXP Candy XL"] },
  { code: "pokemon-utility-pack", title: "Gói chỉnh Pokémon", priceHC: 3, rewards: ["5 Shiny Booster", "64 EXP Candy XL", "5 Egg Move Recorder", "5 Tutor Move Recorder", "Fertility Candy", "10 Gender Swapper", "10 Caught Ball Swapper"] },
  { code: "battle-upgrade-pack", title: "Gói Mega · Z · Dynamax", priceHC: 3, rewards: ["5 Mega Stone", "5 Blank Z", "64 Dynamax Candy", "3 TM Move Recorder", "Sparkling Stone", "EXP Candy XL"] },
  { code: "diamond-pack", title: "2 Kim cương", priceHC: 2, rewards: ["2 Kim cương"] },
  { code: "emerald-pack", title: "15 Ngọc lục bảo", priceHC: 3, rewards: ["15 Ngọc lục bảo"] },
  { code: "stat-candy-pack", title: "Gói kẹo chỉ số", priceHC: 3, rewards: ["3 Health Candy", "3 Mighty Candy", "3 Tough Candy", "3 Smart Candy", "3 Courage Candy", "3 Quick Candy"] },
  { code: "villager-money-pack", title: "Dân làng và 10 triệu CobbleDollar", priceHC: 2, rewards: ["2 trứng Dân làng", "10 vé 1.000.000 CobbleDollar"] },
];

export type SpendMilestone = { amountHC: number; title: string; rewards: string[] };
export const spendMilestones: SpendMilestone[] = [
  { amountHC: 50, title: "Mốc 50 HC", rewards: ["10 Kim cương"] },
  { amountHC: 75, title: "Mốc 75 HC", rewards: ["15 Kim cương", "64 EXP Candy XL", "Titan Hammer + Titan Pauldron", "10 sách phù phép", "128 chai kinh nghiệm", "3 Shiny Swapper", "10 chìa Legendary"] },
  { amountHC: 100, title: "Mốc 100 HC", rewards: ["20 chìa Cosmetic Skin", "5 Shiny Ball", "64 EXP Candy XL", "Gold Incubator", "10 Ability Patch", "5 vé 1.000.000 CobbleDollar", "XP Crystal", "10 chìa Legendary"] },
];

export const topupPacks = [1, 5, 10, 20, 40].map((hunterCoin) => ({ code: `topup-${hunterCoin}`, hunterCoin, priceVnd: hunterCoin * 25_000 }));
export const HUNTER_COIN_PRICE = 25_000;
export const formatVnd = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
