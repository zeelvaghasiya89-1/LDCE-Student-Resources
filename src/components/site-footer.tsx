import Link from "next/link";
import { ArrowUpRight, Instagram } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div><Link href="/" className="brand footer-brand"><span className="brand-mark">L<span>.</span></span><span className="brand-copy"><strong>LDCE</strong><small>STUDENT RESOURCES</small></span></Link><p>Knowledge travels further when we share it.</p></div>
        <div className="footer-links"><Link href="/programs">Programs</Link><Link href="/search">Search library</Link><Link href="/about">About the portal</Link><a href="https://www.ldce.ac.in/" target="_blank" rel="noreferrer">Official LDCE <ArrowUpRight size={13} /></a></div>
        <a className="social-link" href="https://www.instagram.com/ldceofficial/" target="_blank" rel="noreferrer" aria-label="LDCE on Instagram"><Instagram size={17} /></a>
      </div>
      <div className="footer-bottom"><span>Built for the LDCE undergraduate community</span><span>Ahmedabad · Gujarat</span><span>© {new Date().getFullYear()} LDCE Resources</span></div>
    </footer>
  );
}
