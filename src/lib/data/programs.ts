export type Program = {
  name: string;
  slug: string;
  shortName: string;
  accent: string;
  category: string;
};

// Verified against LDCE's official UG admissions page on 2026-09-27.
export const officialPrograms: Program[] = [
  { name: "Artificial Intelligence and Machine Learning", slug: "artificial-intelligence-and-machine-learning", shortName: "AI & ML", accent: "#a9c5ff", category: "Computing" },
  { name: "Automobile Engineering", slug: "automobile-engineering", shortName: "Automobile", accent: "#ffb781", category: "Engineering" },
  { name: "Biomedical Engineering", slug: "biomedical-engineering", shortName: "Biomedical", accent: "#a9e2d0", category: "Engineering" },
  { name: "Chemical Engineering", slug: "chemical-engineering", shortName: "Chemical", accent: "#e6c1a4", category: "Engineering" },
  { name: "Civil Engineering", slug: "civil-engineering", shortName: "Civil", accent: "#d3c6ae", category: "Engineering" },
  { name: "Computer Engineering", slug: "computer-engineering", shortName: "Computer", accent: "#a9c5ff", category: "Computing" },
  { name: "Electrical Engineering", slug: "electrical-engineering", shortName: "Electrical", accent: "#f4d27c", category: "Engineering" },
  { name: "Electronics & Communication Engineering", slug: "electronics-and-communication-engineering", shortName: "E & C", accent: "#bdc4fa", category: "Computing" },
  { name: "Environment Engineering", slug: "environment-engineering", shortName: "Environment", accent: "#a9e2d0", category: "Engineering" },
  { name: "Information Technology", slug: "information-technology", shortName: "IT", accent: "#a9c5ff", category: "Computing" },
  { name: "Instrumentation & Control Engineering", slug: "instrumentation-and-control-engineering", shortName: "I & C", accent: "#d4b9ee", category: "Engineering" },
  { name: "Mechanical Engineering", slug: "mechanical-engineering", shortName: "Mechanical", accent: "#ffb781", category: "Engineering" },
  { name: "Plastic Technology", slug: "plastic-technology", shortName: "Plastic", accent: "#d3c6ae", category: "Engineering" },
  { name: "Robotics and Automation", slug: "robotics-and-automation", shortName: "Robotics", accent: "#d4b9ee", category: "Computing" },
  { name: "Rubber Technology", slug: "rubber-technology", shortName: "Rubber", accent: "#e6c1a4", category: "Engineering" },
  { name: "Textile Technology", slug: "textile-technology", shortName: "Textile", accent: "#f4d27c", category: "Engineering" },
];
