export type Skin = {
  id: string;
  pokemon: string;
  name: string;
  image: string;
  collection: "atelier" | "heroes" | "titans";
  featured?: boolean;
};

export const skins: Skin[] = [
  { id: "gardevoir-2b", pokemon: "Gardevoir", name: "2B", image: "/skins/gardevoir.png", collection: "atelier", featured: true },
  { id: "gardevoir-amy", pokemon: "Gardevoir", name: "Amy", image: "/skins/gardevoir.png", collection: "atelier" },
  { id: "gardevoir-bunny", pokemon: "Gardevoir", name: "Bunny", image: "/skins/gardevoir.png", collection: "atelier", featured: true },
  { id: "gardevoir-fubuki", pokemon: "Gardevoir", name: "Fubuki", image: "/skins/gardevoir.png", collection: "atelier" },
  { id: "gardevoir-lune", pokemon: "Gardevoir", name: "Lune", image: "/skins/gardevoir.png", collection: "atelier" },
  { id: "gardevoir-robin", pokemon: "Gardevoir", name: "Robin", image: "/skins/gardevoir.png", collection: "atelier" },
  { id: "gardevoir-apovoir", pokemon: "Gardevoir", name: "Apovoir", image: "/skins/gardevoir.png", collection: "atelier" },
  { id: "gardevoir-arbidevoir", pokemon: "Gardevoir", name: "Arbidevoir", image: "/skins/gardevoir.png", collection: "atelier" },
  { id: "gardevoir-buttervoir", pokemon: "Gardevoir", name: "Buttervoir", image: "/skins/gardevoir.png", collection: "atelier" },
  { id: "gardevoir-censored", pokemon: "Gardevoir", name: "Censored", image: "/skins/gardevoir.png", collection: "atelier" },
  { id: "gardevoir-despairoir", pokemon: "Gardevoir", name: "Despairoir", image: "/skins/gardevoir.png", collection: "atelier" },
  { id: "gardevoir-rabbivoir", pokemon: "Gardevoir", name: "Rabbivoir", image: "/skins/gardevoir.png", collection: "atelier" },
  { id: "indeedee-maid", pokemon: "Indeedee", name: "Maid", image: "/skins/indeedee.png", collection: "atelier" },
  { id: "indeedee-knight", pokemon: "Indeedee", name: "Knight", image: "/skins/indeedee.png", collection: "heroes" },
  { id: "cyclizar-akira", pokemon: "Cyclizar", name: "Akira", image: "/skins/cyclizar.png", collection: "heroes" },
  { id: "lucario-batman", pokemon: "Lucario", name: "Batman", image: "/skins/lucario.png", collection: "heroes", featured: true },
  { id: "lucario-hyper-ela", pokemon: "Lucario", name: "Hyper / Ela", image: "/skins/lucario.png", collection: "heroes" },
  { id: "buzzwole-superman", pokemon: "Buzzwole", name: "Superman", image: "/skins/buzzwole.png", collection: "heroes" },
  { id: "ceruledge-maou", pokemon: "Ceruledge", name: "Maou", image: "/skins/ceruledge.png", collection: "heroes" },
  { id: "armarouge-axe", pokemon: "Armarouge", name: "Axe", image: "/skins/armarouge.png", collection: "heroes" },
  { id: "aerodactyl-rodan", pokemon: "Aerodactyl", name: "Rodan", image: "/skins/aerodactyl.png", collection: "titans" },
  { id: "charizard-inferno", pokemon: "Charizard", name: "Inferno", image: "/skins/charizard.png", collection: "titans", featured: true },
  { id: "marowak-kidzilla", pokemon: "Marowak", name: "Kidzilla", image: "/skins/marowak.png", collection: "titans" },
  { id: "hydreigon-ghidorah", pokemon: "Hydreigon", name: "King Ghidorah", image: "/skins/hydreigon.png", collection: "titans", featured: true },
  { id: "rillaboom-kong", pokemon: "Rillaboom", name: "King Kong", image: "/skins/rillaboom.png", collection: "titans" },
  { id: "tyranitar-godzilla", pokemon: "Tyranitar", name: "Godzilla", image: "/skins/tyranitar.png", collection: "titans", featured: true },
  { id: "tyrantrum-flora", pokemon: "Tyrantrum", name: "Flora", image: "/skins/tyrantrum.png", collection: "titans" },
  { id: "volcarona-mothra", pokemon: "Volcarona", name: "Mothra", image: "/skins/volcarona.png", collection: "titans" },
  { id: "zeraora-flash", pokemon: "Zeraora", name: "Flash", image: "/skins/zeraora.png", collection: "heroes" },
];

export type Reward = {
  server: "cobblemon" | "rpg";
  rewardType: "hunter_coin" | "rpg_points";
  dailyAmount: number;
  bonusAmount?: number;
};

export type PassProduct = {
  code: string;
  title: string;
  shortTitle: string;
  server: "Cobblemon" | "RPG" | "Combo";
  durationDays: number;
  priceVnd: number;
  rewards: Reward[];
};

export const passProducts: PassProduct[] = [
  { code: "weekly-cobblemon", title: "Thẻ Tuần · Cobblemon", shortTitle: "Tuần", server: "Cobblemon", durationDays: 7, priceVnd: 100_000, rewards: [{ server: "cobblemon", rewardType: "hunter_coin", dailyAmount: 1 }] },
  { code: "weekly-rpg", title: "Thẻ Tuần · RPG", shortTitle: "Tuần", server: "RPG", durationDays: 7, priceVnd: 100_000, rewards: [{ server: "rpg", rewardType: "rpg_points", dailyAmount: 25 }] },
  { code: "monthly-cobblemon", title: "Thẻ Tháng · Cobblemon", shortTitle: "Tháng", server: "Cobblemon", durationDays: 30, priceVnd: 300_000, rewards: [{ server: "cobblemon", rewardType: "hunter_coin", dailyAmount: 2 }] },
  { code: "monthly-rpg", title: "Thẻ Tháng · RPG", shortTitle: "Tháng", server: "RPG", durationDays: 30, priceVnd: 300_000, rewards: [{ server: "rpg", rewardType: "rpg_points", dailyAmount: 50 }] },
  { code: "season-cobblemon", title: "Thẻ Mùa · Cobblemon", shortTitle: "Mùa", server: "Cobblemon", durationDays: 90, priceVnd: 800_000, rewards: [{ server: "cobblemon", rewardType: "hunter_coin", dailyAmount: 2, bonusAmount: 5 }] },
  { code: "season-rpg", title: "Thẻ Mùa · RPG", shortTitle: "Mùa", server: "RPG", durationDays: 90, priceVnd: 800_000, rewards: [{ server: "rpg", rewardType: "rpg_points", dailyAmount: 50, bonusAmount: 150 }] },
  { code: "monthly-combo", title: "Thẻ Tháng Super Combo", shortTitle: "Super Combo", server: "Combo", durationDays: 30, priceVnd: 500_000, rewards: [{ server: "cobblemon", rewardType: "hunter_coin", dailyAmount: 2 }, { server: "rpg", rewardType: "rpg_points", dailyAmount: 50 }] },
];

export const HUNTER_COIN_PRICE = 25_000;

export const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
