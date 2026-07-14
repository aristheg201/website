import Link from "next/link";

type HeaderProps = {
  ctaHref?: string;
  ctaLabel?: string;
};

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Hunter Network — về trang chủ">
      <span className="brand-main">HUNTER</span>
      <span className="brand-sub">NETWORK</span>
    </Link>
  );
}

export function SiteHeader({ ctaHref = "/#topup", ctaLabel = "Nạp HC" }: HeaderProps) {
  return (
    <header className="site-header section-shell">
      <Brand />
      <nav aria-label="Điều hướng chính">
        <Link href="/#skins">Skin</Link>
        <Link href="/#passes">Thẻ</Link>
        <Link href="/huong-dan">Tải mod</Link>
        <Link href="/wiki">Wiki</Link>
      </nav>
      <Link className="nav-cta" href={ctaHref}>{ctaLabel}<span aria-hidden="true">→</span></Link>
    </header>
  );
}
