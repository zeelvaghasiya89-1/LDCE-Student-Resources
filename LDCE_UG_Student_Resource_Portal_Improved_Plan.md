# LDCE UG Student Resource Portal — Improved Delivery Plan

This plan records the implementation decisions and delivery gates for the LDCE undergraduate academic resource portal. The original plan is project context; implementation must still verify real LDCE and GTU data before publishing it.

## Product scope

- Students browse programs, semesters, subjects, and approved resources without accounts.
- Faculty authenticate and submit course resources for moderation.
- Admins maintain the academic catalog, faculty assignments, and moderation.
- Public files remain in a private Cloudflare R2 bucket and are delivered with short-lived signed URLs.
- Collect only faculty account details required to operate the portal; do not collect student data.

## Architecture

- Next.js App Router, TypeScript, Tailwind CSS, and Three.js for a restrained animated visual identity with reduced-motion and low-power fallbacks.
- Supabase Postgres and Auth; every exposed table has RLS. Privileged role checks read server-managed profile records, never user-editable JWT metadata.
- Cloudflare R2 private bucket for PDFs; the application validates faculty subject assignment and file metadata before signing uploads, verifies uploaded objects, then records them as pending review.
- Vercel deploys the GitHub source. Secrets stay in server-only environment variables; only the Supabase URL and publishable key are public.
- pnpm is the pinned package manager, avoiding a separate system-wide npm/toolchain installation requirement.

## Data quality rules

- Seed only official LDCE UG programs with the official source URL and date.
- Keep semester and subject tables database-driven. Do not invent current GTU subject codes, names, credits, schemes, or faculty assignments; add these after checking the applicable official GTU curriculum.
- Make program and catalog records deactivatable so existing resource links remain stable.
- Do not publish uploaded material until an administrator approves it.

## Delivery phases and acceptance criteria

1. **Foundation:** Install dependencies; create responsive public shell, program index/detail routes, search, first-year entry point, accessible Three.js ambient scene, metadata, sitemap, and robots rules. Build and type-check cleanly.
2. **Data/security:** Create versioned Supabase migrations, catalog seed, role model, and RLS. Run Supabase security and performance advisors; resolve security findings before launch.
3. **Faculty workflow:** Add faculty sign-in, assigned-subject checks, signed R2 upload, pending review, and faculty status view. Keep R2 private and secrets server-side.
4. **Administration:** Add moderator queue and approve/reject controls. Complete faculty/subject assignment and catalog CRUD before onboarding multiple departments.
5. **Launch:** Connect source repository, configure Vercel variables and Supabase Auth redirect URLs, configure exact R2 CORS origins, deploy, then verify browse/search, faculty sign-in, upload, approval, preview/download, mobile layout, and canonical SEO URLs on the live domain.
6. **Content completion:** Import verified current GTU scheme data and seed representative resources only when licensed/authorized and reviewed.

## Current implementation status (2026-09-27)

- Implemented: public portal shell, animated Three.js scene, verified 16-program catalogue, public program/year/subject/resource/search routes, faculty authentication and upload flow, moderator queue, private R2 signed file delivery, Supabase schema/security migrations, metadata, sitemap, and robots rules.
- Provisioned: Supabase project `ldce-student-resources` in Mumbai on the selected $0/month plan; private Cloudflare R2 bucket `ldce-student-resources` in APAC.
- Verified locally: ESLint, TypeScript, and optimized Next.js production build pass. Supabase security advisor reports no findings. Performance advisor reports currently unused indexes because catalog/resource traffic has not started; keep those indexes until real usage demonstrates they are unnecessary.
- Intentionally not seeded: GTU semester/subject curriculum, faculty accounts, and academic resources, pending source verification and administrator-provided content.
- Launch blockers: GitHub and Vercel account authorization, production environment variables, a bucket-scoped R2 S3 credential, R2 CORS restricted to the real site origin, and initial admin/faculty bootstrap.
- Not yet implemented to the original full admin scope: faculty management, academic catalog CRUD, platform statistics, resource editing/deletion, and multi-file submissions. Complete these before treating the portal as feature-complete.

## Production checklist

- [ ] Connect the empty GitHub repository and publish the reviewed source.
- [ ] Create/link the Vercel project and add environment variables.
- [ ] Create a bucket-scoped R2 S3 token; store its secret only in Vercel.
- [ ] Set R2 CORS to the production origin and required PUT/GET/HEAD headers/methods.
- [ ] Configure Supabase Auth site URL and redirect allow-list.
- [ ] Bootstrap a trusted admin profile; use that account to verify faculty and moderation flows.
- [ ] Deploy and verify public browsing and production workflows on the public URL.
- [ ] Record launch URL, remaining curriculum/content work, and operational ownership.
