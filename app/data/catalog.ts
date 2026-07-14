export type Skin = {
  id: string;
  pokemon: string;
  name: string;
  renderIndex: number;
  image: string;
  collection: "atelier" | "heroes" | "titans";
  featured?: boolean;
};

let skinRenderIndex = 0;
const skin = (id: string, pokemon: string, name: string, collection: Skin["collection"], featured = false): Skin => ({
  id,
  pokemon,
  name,
  collection,
  featured,
  renderIndex: skinRenderIndex++,
  image: `/skins/${pokemon.toLowerCase().replaceAll(" ", "-")}.png`,
});

export const skins: Skin[] = [
  skin("gardevoir-2b", "Gardevoir", "2B", "atelier", true),
  skin("gardevoir-amy", "Gardevoir", "Amy", "atelier"),
  skin("gardevoir-bunny", "Gardevoir", "Bunny", "atelier", true),
  skin("gardevoir-fubuki", "Gardevoir", "Fubuki", "atelier"),
  skin("gardevoir-lune", "Gardevoir", "Lune", "atelier"),
  skin("gardevoir-robin", "Gardevoir", "Robin", "atelier"),
  skin("gardevoir-apovoir", "Gardevoir", "Apovoir", "atelier"),
  skin("gardevoir-arbidevoir", "Gardevoir", "Arbidevoir", "atelier"),
  skin("gardevoir-buttervoir", "Gardevoir", "Buttervoir", "atelier"),
  skin("gardevoir-censored", "Gardevoir", "Censored", "atelier"),
  skin("gardevoir-despairoir", "Gardevoir", "Despairoir", "atelier"),
  skin("gardevoir-rabbivoir", "Gardevoir", "Rabbivoir", "atelier"),
  skin("indeedee-maid", "Indeedee", "Maid", "atelier"),
  skin("indeedee-knight", "Indeedee", "Knight", "heroes"),
  skin("cyclizar-akira", "Cyclizar", "Akira", "heroes"),
  skin("lucario-batman", "Lucario", "Batman", "heroes", true),
  skin("lucario-hyper-ela", "Lucario", "Hyper / Ela", "heroes"),
  skin("buzzwole-superman", "Buzzwole", "Superman", "heroes"),
  skin("ceruledge-maou", "Ceruledge", "Maou", "heroes"),
  skin("armarouge-axe", "Armarouge", "Axe", "heroes"),
  skin("aerodactyl-rodan", "Aerodactyl", "Rodan", "titans"),
  skin("charizard-inferno", "Charizard", "Inferno", "titans", true),
  skin("marowak-kidzilla", "Marowak", "Kidzilla", "titans"),
  skin("hydreigon-ghidorah", "Hydreigon", "King Ghidorah", "titans", true),
  skin("rillaboom-kong", "Rillaboom", "King Kong", "titans"),
  skin("tyranitar-godzilla", "Tyranitar", "Godzilla", "titans", true),
  skin("tyrantrum-flora", "Tyrantrum", "Flora", "titans"),
  skin("volcarona-mothra", "Volcarona", "Mothra", "titans"),
  skin("zeraora-flash", "Zeraora", "Flash", "heroes"),
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
export const formatVnd = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
