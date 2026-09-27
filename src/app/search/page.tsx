import type { Metadata } from "next";
import { Search } from "lucide-react";
import { getPrograms } from "@/lib/programs";

export const metadata: Metadata = { title: "Search the library", description: "Search LDCE undergraduate academic resources." };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const programs = await getPrograms();
  const matches = programs.filter((item) => `${item.name} ${item.shortName}`.toLowerCase().includes(q.toLowerCase()));
  return <div className="search-page"><span className="eyebrow">SEARCH THE LIBRARY</span><h1>What are you<br /><em>looking for?</em></h1><form className="large-search"><Search size={20} /><input name="q" defaultValue={q} placeholder="Try a program name or subject code" autoFocus /><button type="submit">Search</button></form><p className="search-caption">{q ? `${matches.length} program${matches.length === 1 ? "" : "s"} matching “${q}”` : "Search academic resources across the library"}</p>{q && <div className="search-results">{matches.map((program) => <a key={program.slug} href={`/programs/${program.slug}`}><span><small>{program.category}</small><strong>{program.name}</strong></span><span>Explore <Search size={14} /></span></a>)}{!matches.length && <div className="catalog-empty"><h3>No programs found</h3><p>Try a different name or spelling. Subject and resource search will expand as verified course listings are added.</p></div>}</div>}</div>;
}
