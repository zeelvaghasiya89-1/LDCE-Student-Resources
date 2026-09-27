"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Search } from "lucide-react";
import type { Program } from "@/lib/data/programs";

export function ProgramBrowser({ programs }: { programs: Program[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All programs");
  const visible = useMemo(() => programs.filter((program) => {
    const matchesName = `${program.name} ${program.shortName}`.toLowerCase().includes(query.toLowerCase());
    return matchesName && (category === "All programs" || program.category === category);
  }), [programs, query, category]);

  return (
    <section className="program-section" id="programs">
      <div className="section-heading">
        <div><span className="eyebrow">THE LIBRARY</span><h2>Find your <em>field.</em></h2></div>
        <p>Start with your program. Your semester and subjects are one step away.</p>
      </div>
      <div className="program-toolbar">
        <label className="program-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a program" aria-label="Find a program" /></label>
        <div className="filter-tabs" role="group" aria-label="Filter programs">
          {["All programs", "Computing", "Engineering"].map((item) => <button key={item} onClick={() => setCategory(item)} className={category === item ? "active" : ""}>{item}</button>)}
        </div>
        <span className="program-count">{String(visible.length).padStart(2, "0")} PROGRAMS</span>
      </div>
      <div className="program-grid">
        {visible.map((program, index) => (
          <Link className="program-card" href={`/programs/${program.slug}`} key={program.slug} style={{ "--program-accent": program.accent } as React.CSSProperties}>
            <div className="program-card-top"><span className="program-index">{String(index + 1).padStart(2, "0")}</span><span className="program-category">{program.category}</span><ArrowUpRight className="card-arrow" size={18} /></div>
            <h3>{program.name}</h3>
            <div className="program-card-bottom"><span>{program.shortName}</span><span>Explore program <ArrowDownRight size={14} /></span></div>
          </Link>
        ))}
        {!visible.length && <div className="empty-state">No programs match “{query}”. Try another search.</div>}
      </div>
    </section>
  );
}
