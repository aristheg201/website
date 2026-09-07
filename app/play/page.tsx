import type { Metadata } from "next";
import PlayCenter from "../components/play-center";

export const metadata: Metadata = {
  title: "Tải Bestiary Launcher — SVFrame Poké Portal",
  description: "Tải Bestiary Launcher chính thức cho SVFrame Cobblemon từ GitHub Releases.",
};

export default function PlayPage() {
  return <PlayCenter />;
}
