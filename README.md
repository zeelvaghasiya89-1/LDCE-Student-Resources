# LDCE Student Resources

A public, no-login academic resource portal for LDCE undergraduate students, with Supabase faculty authentication and a private Cloudflare R2 PDF bucket.

## What is improved from the implementation plan

- The current official LDCE undergraduate admissions page is the source for program seed data. It lists 16 four-year programs; the seed records the URL and verification date. The catalogue is not hard-coded into UI components.
- No subjects, faculty, or learning materials are fabricated. Semester and subject records are added after checking the relevant GTU scheme and program curriculum. The schema supports shared first-year semesters separately from program-specific semesters.
- Uploads use a short-lived, subject-bound signed R2 upload URL, followed by server-side object validation and a pending-review database record. The bucket stays private; public access is never enabled.
- Authorization reads an administrator-managed row in `profiles`, and the database enforces row-level access as a second layer. User-editable metadata is not used to grant access. A narrowly scoped role lookup function lives in the non-exposed `private` schema.
- R2 secrets and database service keys are server-only. Public PDF access is issued only for published resources and through a short-lived signed download URL.

## Stack

Next.js App Router, TypeScript, Tailwind CSS, Lucide, Three.js, Supabase PostgreSQL/Auth, Cloudflare R2, Vercel.

## Local setup

1. Install Node.js 20.9 or newer and pnpm 9 or newer.
2. Run `pnpm install`.
3. Copy `.env.example` to `.env.local` and fill in Supabase and R2 values. Do not commit `.env.local`.
4. Apply `supabase/migrations/20260927000100_portal_schema.sql` to the intended Supabase project, then seed the 16 verified programs from the same migration.
5. Create the first admin account in Supabase Auth, then add its profile using the SQL Editor with `INSERT INTO public.profiles (user_id, full_name, email, role) VALUES ('<auth-user-uuid>', '<name>', '<email>', 'admin');`. Create/invite faculty in Supabase Auth, add each faculty profile, then assign approved subjects in the admin portal.
6. Run `pnpm dev`.

No Supabase service-role secret is needed in this app. Public reads and authenticated faculty actions use the Supabase publishable key plus RLS.

## Environment variables

| Name | Use | Exposure |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Public |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key | Public; RLS protects data |
| `R2_ACCOUNT_ID` | Cloudflare account for S3 API | Server only |
| `R2_ACCESS_KEY_ID` | Scoped R2 S3 token | Server only |
| `R2_SECRET_ACCESS_KEY` | Scoped R2 S3 token secret | Server only |
| `R2_BUCKET_NAME` | Private resource bucket | Server only |
| `NEXT_PUBLIC_SITE_URL` | Canonical production URL | Public |

## Production checklist

- Connect the GitHub repository to Vercel and set production environment variables.
- Create the Supabase project in the selected organization and target the correct region. Review provider pricing before confirmation.
- Create a private R2 bucket and a narrowly scoped S3 API token for that bucket. Do not enable the `r2.dev` public URL.
- Add the production site URL to Supabase Auth's allowed redirect URLs.
- Apply the checked-in migration and verify RLS policies before inviting faculty.
- Create a trusted admin profile and check that the account can review a pending resource.
- Verify PDF uploads, approval, student preview and download on the production URL.
- Add verified semester/subject data from the applicable GTU curriculum. Confirm source and scheme year before publishing it.

## Current catalogue source

- [LDCE UG admissions — official programs](https://www.ldce.ac.in/admissions/ug-programs) — verified 2026-09-27.
- [LDCE GTU affiliation](https://ldce.ac.in/admissions/gtu-affiliation) — reference for locating curriculum sources; a specific applicable GTU curriculum still needs to be selected before semester/subject records are added.

## Routes

- Public: `/`, `/programs`, `/programs/[programSlug]`, `/first-year`, `/subjects/[subjectSlug]`, `/resources/[resourceSlug]`, `/search`, `/about`.
- Faculty: `/faculty/login`, `/faculty`, `/faculty/resources`, `/faculty/resources/new`.
- Admin: `/admin`, `/admin/resources/pending`.
