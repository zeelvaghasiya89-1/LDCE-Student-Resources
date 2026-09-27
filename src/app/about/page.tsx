import type { Metadata } from "next";
import { ArrowUpRight, HeartHandshake, ShieldCheck, Users } from "lucide-react";

export const metadata: Metadata = { title: "About the portal", description: "A student-first academic resource library for LDCE undergraduate students." };

export default function AboutPage() {
  return <div className="about-page"><span className="eyebrow">ABOUT THE PORTAL</span><h1>Learning gets<br /><em>better together.</em></h1><p className="about-lede">LDCE Student Resources is a simple idea: make the academic material students need easier to find, and easier to share responsibly.</p><div className="about-values"><article><Users size={20} /><span className="eyebrow">FOR STUDENTS</span><h2>Open from the start.</h2><p>Browse without creating an account or sharing personal details.</p></article><article><HeartHandshake size={20} /><span className="eyebrow">FROM FACULTY</span><h2>Shared with care.</h2><p>Faculty contribute resources that are reviewed before they join the public library.</p></article><article><ShieldCheck size={20} /><span className="eyebrow">BUILT RESPONSIBLY</span><h2>Clear, reliable sources.</h2><p>Program names follow official LDCE listings. Subject maps are added from verified curricula.</p></article></div><a className="text-link" href="https://www.ldce.ac.in/" target="_blank" rel="noreferrer">Visit the official LDCE website <ArrowUpRight size={15} /></a></div>;
}
