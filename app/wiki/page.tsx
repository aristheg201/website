import type { Metadata } from "next";
import WikiExplorer from "../components/wiki-explorer";

export const metadata: Metadata = {
  title: "Wiki spawn Pokémon — Hunter Network",
  description: "Tra cứu Pokémon spawn ở biome nào, cấp độ, khung giờ và độ hiếm theo datapack Hunter Network.",
};

export default function WikiPage() {
  return <WikiExplorer />;
}
