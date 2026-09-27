"use client";

import { useEffect, useState } from "react";
import { Check, ExternalLink, X } from "lucide-react";

type PendingResource = { id: string; title: string; description: string | null; resource_type: string; academic_year: string | null; created_at: string; subjects: { name: string; code: string | null; semesters: { name: string; programs: { name: string } } } };

export function ModerationQueue() {
  const [resources, setResources] = useState<PendingResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  useEffect(() => { void fetch("/api/admin/resources").then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); setResources(data.resources); }).catch((cause) => setError(cause instanceof Error ? cause.message : "Could not load queue.")).finally(() => setLoading(false)); }, []);
  async function moderate(id: string, status: "published" | "rejected") {
    let reason = "";
    if (status === "rejected") { reason = window.prompt("Why is this resource being returned for edits?")?.trim() ?? ""; if (!reason) return; }
    setBusyId(id); setError("");
    const response = await fetch(`/api/admin/resources/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, reason }) });
    const result = await response.json();
    if (!response.ok) setError(result.error ?? "Could not update this resource."); else setResources((items) => items.filter((item) => item.id !== id));
    setBusyId("");
  }
  if (loading) return <div className="empty-dashboard">Loading review queue…</div>;
  return <div className="moderation-list">{error && <p className="form-error" role="alert">{error}</p>}{resources.map((resource) => <article className="moderation-card" key={resource.id}><div className="moderation-meta"><span className="eyebrow">{resource.subjects.semesters.programs.name} · {resource.subjects.semesters.name}</span><span className="status-pill status-pending_review">PENDING REVIEW</span></div><h2>{resource.title}</h2><p>{resource.description || "No description provided."}</p><div className="moderation-detail">{resource.subjects.name} {resource.subjects.code ? `· ${resource.subjects.code}` : ""}<span>{resource.resource_type.replaceAll("_", " ")}</span>{resource.academic_year && <span>{resource.academic_year}</span>}</div><div className="moderation-actions"><a href={`/api/resources/${resource.id}/file`} target="_blank" rel="noreferrer" className="text-link"><ExternalLink size={14} /> Preview PDF</a><button className="approve-button" disabled={busyId === resource.id} onClick={() => void moderate(resource.id, "published")}><Check size={14} /> Approve</button><button className="reject-button" disabled={busyId === resource.id} onClick={() => void moderate(resource.id, "rejected")}><X size={14} /> Return with reason</button></div></article>)}{!resources.length && !error && <div className="empty-dashboard"><Check size={24} /><h3>You’re all caught up</h3><p>New faculty uploads will appear here for review.</p></div>}</div>;
}
