import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Compass, FileText, Sparkles } from "lucide-react";
import { AmbientScene } from "@/components/ambient-scene";
import { ProgramBrowser } from "@/components/program-browser";
import { getPrograms } from "@/lib/programs";

export default async function HomePage() {
  const programs = await getPrograms();
  return (
    <>
      <section className="hero">
        <AmbientScene />
        <div className="hero-grain" />
        <div className="hero-content">
          <div className="hero-kicker"><span className="status-dot" /> AN OPEN LIBRARY FOR LDCE UNDERGRADS</div>
          <h1>Find your<br /><em>next</em> good idea<span className="period">.</span></h1>
          <p className="hero-description">The notes, papers and study material you need, gathered in one thoughtful place. Made for how LDCE students actually learn.</p>
          <div className="hero-actions"><Link className="button button-light" href="#programs">Explore the library <ArrowRight size={16} /></Link><Link className="quiet-link" href="/about">How it works <ArrowUpRight size={15} /></Link></div>
          <div className="hero-footnote"><span>01 — LEARN TOGETHER</span><span>EST. FOR STUDENTS, BY STUDENTS</span></div>
        </div>
        <div className="hero-visual-caption"><span className="caption-line" /> IDEAS IN MOTION <span className="caption-coordinates">23°02′ N&nbsp; 72°32′ E</span></div>
        <Link className="scroll-cue" href="#programs" aria-label="Scroll to programs"><ArrowDown size={16} /></Link>
        <div className="hero-badge"><span className="badge-spark"><Sparkles size={14} /></span><span><strong>Open by design</strong><small>No student sign-in required</small></span></div>
      </section>

      <section className="intro-strip"><span>GOOD RESOURCES<br />CHANGE EVERYTHING.</span><p>From your first semester to your final project, find a clearer path through the work — with a little help from the students who came before you.</p><Link className="intro-number" href="/first-year">LDCE<br />∞</Link></section>

      <ProgramBrowser programs={programs} />

      <section className="how-section">
        <div className="how-title"><span className="eyebrow">A BETTER WAY TO STUDY</span><h2>Less hunting.<br /><em>More learning.</em></h2><p>Academic material, organized around your actual course. Built for quick answers and deeper dives.</p><Link className="text-link" href="/programs">Choose your program <ArrowRight size={15} /></Link></div>
        <div className="how-steps">
          <article className="how-card"><span className="how-number">01</span><span className="how-icon"><Compass size={21} /></span><h3>Start with where you are</h3><p>Pick your program, then move through semesters and subjects.</p><span className="how-corner"><ArrowUpRight size={17} /></span></article>
          <article className="how-card"><span className="how-number">02</span><span className="how-icon"><BookOpen size={21} /></span><h3>Find your kind of resource</h3><p>Previous papers, notes, lab manuals, syllabi and more.</p><span className="how-corner"><ArrowUpRight size={17} /></span></article>
          <article className="how-card how-card-accent"><span className="how-number">03</span><span className="how-icon"><FileText size={21} /></span><h3>Get right into it</h3><p>Preview what you need. Save time for the problem at hand.</p><span className="how-corner"><ArrowUpRight size={17} /></span></article>
        </div>
      </section>

      <section className="contribute-band"><div className="contribute-orbit"><span /><span /><span /></div><div><span className="eyebrow">GOOD WORK DESERVES TO BE SHARED</span><h2>Have something<br />worth passing on?</h2><p>Faculty can add their course resources to help the next student find their way.</p></div><Link href="/faculty/login" className="button button-dark">Faculty sign in <ArrowUpRight size={16} /></Link></section>
      <div className="resource-note">{programs.length} undergraduate programs <span>·</span> First-year common resources <span>·</span> Updated as the curriculum grows</div>
    </>
  );
}
