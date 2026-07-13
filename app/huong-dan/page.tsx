import type { Metadata } from "next";
import InstallGuide from "../components/install-guide";

export const metadata: Metadata = {
  title: "Tải mod & hướng dẫn cài — Hunter Network",
  description: "Tải bộ Cobblemon Full/Lite, cài Fabric 1.21.1 Loader 0.18.4 và kết nối Hunter Network.",
};

export default function GuidePage() {
  return <InstallGuide />;
}
