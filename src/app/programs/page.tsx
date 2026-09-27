import type { Metadata } from "next";
import { ProgramBrowser } from "@/components/program-browser";
import { getPrograms } from "@/lib/programs";

export const metadata: Metadata = { title: "Browse undergraduate programs", description: "Browse verified undergraduate programs at L. D. College of Engineering." };

export default async function ProgramsPage() {
  const programs = await getPrograms();
  return <div className="page-wrap"><div className="page-hero"><span className="eyebrow">THE LDCE LIBRARY</span><h1>Every discipline.<br /><em>One starting point.</em></h1><p>Choose your program to find semester-wise subjects and resources.</p></div><ProgramBrowser programs={programs} /></div>;
}
