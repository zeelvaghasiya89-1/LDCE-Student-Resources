import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://ldce-student-resources.vercel.app"),
  title: { default: "LDCE Student Resources — Your next good idea starts here", template: "%s · LDCE Resources" },
  description: "A student-built library of learning resources for undergraduate students at L. D. College of Engineering, Ahmedabad.",
  openGraph: { title: "LDCE Student Resources", description: "Find your focus. Find what you need.", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SiteHeader /><main>{children}</main><SiteFooter /></body></html>;
}
