import Link from "next/link";
const BASE_PATH=process.env.NEXT_PUBLIC_BASE_PATH??"/website";
export function Brand(){return <Link href="/" className="brand" aria-label="SVFrame Network"><img src={`${BASE_PATH}/brand/tenten.webp`} alt="SVFrame Network"/><span><b>SVFRAME</b><small>NETWORK</small></span></Link>}
export function SiteHeader({ctaHref="/#topup",ctaLabel="Nạp HC"}:{ctaHref?:string;ctaLabel?:string}){return <header className="site-header section-shell"><Brand/><nav><Link href="/#skins">Skin</Link><Link href="/#shop">Vật phẩm</Link><Link href="/#milestones">Tích tiêu</Link><Link href="/huong-dan">Tải mod</Link><Link href="/wiki">Wiki</Link></nav><Link className="nav-cta" href={ctaHref}>{ctaLabel}<span>→</span></Link></header>}
