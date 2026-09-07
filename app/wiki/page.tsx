import type { Metadata } from "next";
import WorldDex from "../components/world-dex";

export const metadata: Metadata = {
  title: "World Dex — SVFrame Poké Portal",
  description: "Tra cứu Pokémon, Fakemon, custom form, biome, structure, level, thời gian và điều kiện spawn trên SVFrame.",
};

export default function WikiPage() {
  return <WorldDex />;
}
