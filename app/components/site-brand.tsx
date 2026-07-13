import Link from "next/link";

type HeaderProps = {
  ctaHref?: string;
  ctaLabel?: string;
};

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5" /></svg>;
}

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Hunter Network - về trang chủ">
      <span className="brand-mark"><span /></span>
      <span className="brand-copy"><b>HUNTER</b><small>NETWORK</small></span>
    </Link>
  );
}

export function SiteHeader({ ctaHref = "/#topup", ctaLabel = "NẠP HC" }: HeaderProps) {
  return (
    <header className="site-header">
      <Brand />
      <nav aria-label="Điều hướng chính">
        <Link href="/#skins">Skin</Link>
        <Link href="/#passes">Thẻ</Link>
        <Link href="/huong-dan">Tải mod</Link>
        <Link href="/wiki">Wiki</Link>
      </nav>
      <Link className="nav-cta" href={ctaHref}><span>{ctaLabel}</span><ArrowIcon /></Link>
    </header>
  );
}
