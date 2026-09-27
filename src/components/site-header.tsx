import Link from "next/link";
import { ArrowUpRight, Menu, Search } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="LDCE Resources home">
        <span className="brand-mark">L<span>.</span></span>
        <span className="brand-copy"><strong>LDCE</strong><small>STUDENT RESOURCES</small></span>
      </Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        <Link href="/programs">Explore library</Link>
        <Link href="/search">Discover</Link>
        <Link href="/about">About</Link>
      </nav>
      <div className="header-actions">
        <Link href="/search" className="icon-button" aria-label="Search resources"><Search size={18} /></Link>
        <Link href="/faculty/login" className="faculty-link">Faculty portal <ArrowUpRight size={15} /></Link>
        <button className="icon-button mobile-menu" aria-label="Open navigation menu"><Menu size={19} /></button>
      </div>
    </header>
  );
}
