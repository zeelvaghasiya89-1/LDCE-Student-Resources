import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ModerationQueue } from "@/components/moderation-queue";

export const metadata: Metadata = { title: "Review pending resources" };
export default function PendingResourcesPage() { return <div className="dashboard-page"><Link href="/admin" className="back-link"><ArrowLeft size={14} /> Admin overview</Link><div className="dashboard-top"><div><span className="eyebrow">ADMINISTRATION</span><h1>Review resources</h1><p>Approve useful material or return it to faculty with a clear reason.</p></div></div><ModerationQueue /></div>; }
