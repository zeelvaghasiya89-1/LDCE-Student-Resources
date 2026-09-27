"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";

export type SubjectOption = { id: string; name: string; code: string | null; context: string };
const resourceTypes = [["question_paper", "Question paper"], ["notes", "Notes"], ["study_material", "Study material"], ["lab_manual", "Lab manual"], ["syllabus", "Syllabus"], ["question_bank", "Question bank"], ["reference_material", "Reference material"], ["other", "Other"]];

export function ResourceUploadForm({ subjects }: { subjects: SubjectOption[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage("");
    const form = new FormData(event.currentTarget);
    if (!selectedFile) { setError("Choose a PDF file to continue."); return; }
    if (selectedFile.type !== "application/pdf" || !selectedFile.name.toLowerCase().endsWith(".pdf")) { setError("Only PDF files are supported."); return; }
    if (selectedFile.size > 20 * 1024 * 1024) { setError("The PDF must be 20 MB or smaller."); return; }
    setBusy(true); setMessage("Preparing secure upload…");
    try {
      const details = { subjectId: form.get("subjectId"), mimeType: selectedFile.type, fileName: selectedFile.name, fileSize: selectedFile.size };
      const signedResponse = await fetch("/api/resources/upload-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(details) });
      const signed = await signedResponse.json();
      if (!signedResponse.ok) throw new Error(signed.error ?? "Could not start the upload.");
      setMessage("Uploading your PDF…");
      const uploaded = await fetch(signed.uploadUrl, { method: "PUT", headers: { "Content-Type": "application/pdf" }, body: selectedFile });
      if (!uploaded.ok) throw new Error("The PDF could not be uploaded. Please try again.");
      setMessage("Saving resource details…");
      const finalize = await fetch("/api/resources/finalize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: signed.key, subjectId: form.get("subjectId"), title: form.get("title"), description: form.get("description"), type: form.get("type"), questionPaperType: form.get("questionPaperType") || null, academicYear: form.get("academicYear") || undefined, fileName: selectedFile.name }) });
      const result = await finalize.json();
      if (!finalize.ok) throw new Error(result.error ?? "Could not submit this resource.");
      setMessage("Submitted for review. Students can access it once an admin approves it.");
      setTimeout(() => router.push("/faculty/resources"), 1600);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Something went wrong."); setMessage(""); }
    finally { setBusy(false); }
  }

  return <form className="resource-form" onSubmit={submit}><div className="form-grid"><label className="form-wide">Resource title<input name="title" required minLength={3} maxLength={180} placeholder="e.g. Mid semester examination — 2025" /></label><label className="form-wide">Subject<select name="subjectId" required defaultValue=""><option value="" disabled>Select an assigned subject</option>{subjects.map((subject) => <option value={subject.id} key={subject.id}>{subject.name}{subject.code ? ` · ${subject.code}` : ""} — {subject.context}</option>)}</select></label><label>Resource type<select name="type" defaultValue="notes">{resourceTypes.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label>Academic year<input name="academicYear" placeholder="2025-26" pattern="20[0-9]{2}(-[0-9]{2})?" /></label><label className="form-wide">Question paper category<select name="questionPaperType" defaultValue=""><option value="">Not applicable</option><option value="mid_semester">Mid semester</option><option value="university_exam">University exam</option><option value="practical">Practical</option><option value="internal">Internal</option><option value="previous_year">Previous year</option><option value="other">Other</option></select></label><label className="form-wide">Description<textarea name="description" rows={3} maxLength={2000} placeholder="A short note to help students know what’s inside." /></label><label className="form-wide file-drop"><UploadCloud size={20} /><strong>{selectedFile ? selectedFile.name : "Choose a PDF to upload"}</strong><small>{selectedFile ? `${(selectedFile.size / 1048576).toFixed(1)} MB` : "PDF only · Up to 20 MB"}</small><input type="file" accept="application/pdf,.pdf" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} /></label></div>{error && <p className="form-error" role="alert">{error}</p>}{message && <p className="form-message" role="status">{message}</p>}<button type="submit" className="button button-dark" disabled={busy || !subjects.length}>{busy ? "Submitting…" : "Submit for review"} <span>→</span></button><p className="form-footnote">Uploads are private until they pass admin review.</p></form>;
}
