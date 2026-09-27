create type public.portal_role as enum ('faculty', 'admin');
create type public.resource_status as enum ('draft', 'pending_review', 'published', 'rejected', 'archived');
create type public.resource_type as enum ('question_paper', 'notes', 'study_material', 'lab_manual', 'syllabus', 'question_bank', 'reference_material', 'other');
create type public.question_paper_type as enum ('mid_semester', 'university_exam', 'practical', 'internal', 'previous_year', 'other');

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text not null,
  slug text not null unique,
  description text,
  category text not null default 'Engineering',
  accent text,
  source_url text,
  source_verified_on date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.semesters (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references public.programs(id) on delete cascade,
  shared_year smallint check (shared_year between 1 and 4),
  semester_number smallint not null check (semester_number between 1 and 12),
  name text not null,
  curriculum_year text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint semester_has_one_parent check ((program_id is null) <> (shared_year is null))
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  semester_id uuid not null references public.semesters(id) on delete cascade,
  name text not null,
  code text,
  slug text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (semester_id, code)
);

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role public.portal_role not null default 'faculty',
  program_id uuid references public.programs(id) on delete set null,
  department text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.faculty_subjects (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.profiles(user_id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (faculty_id, subject_id)
);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete restrict,
  uploaded_by uuid not null references public.profiles(user_id) on delete restrict,
  title text not null,
  slug text not null unique,
  description text,
  resource_type public.resource_type not null,
  question_paper_type public.question_paper_type,
  academic_year text,
  status public.resource_status not null default 'pending_review',
  rejection_reason text,
  published_at timestamptz,
  search_document tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.resource_files (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete cascade,
  original_filename text not null,
  storage_key text not null unique,
  mime_type text not null check (mime_type = 'application/pdf'),
  file_size bigint not null check (file_size > 0 and file_size <= 20971520),
  created_at timestamptz not null default now()
);

create unique index semesters_program_number_idx on public.semesters(program_id, semester_number) where program_id is not null;
create unique index semesters_shared_year_number_idx on public.semesters(shared_year, semester_number) where shared_year is not null;
create index semesters_program_active_idx on public.semesters(program_id, semester_number) where is_active;
create index subjects_semester_active_idx on public.subjects(semester_id, name) where is_active;
create index resources_subject_status_created_idx on public.resources(subject_id, status, created_at desc);
create index resources_uploaded_by_created_idx on public.resources(uploaded_by, created_at desc);
create index resources_search_document_idx on public.resources using gin(search_document);
create index faculty_subjects_subject_idx on public.faculty_subjects(subject_id);

alter table public.programs enable row level security;
alter table public.semesters enable row level security;
alter table public.subjects enable row level security;
alter table public.profiles enable row level security;
alter table public.faculty_subjects enable row level security;
alter table public.resources enable row level security;
alter table public.resource_files enable row level security;

create policy "Active programs are public" on public.programs for select to anon, authenticated using (is_active);
create policy "Active semesters are public" on public.semesters for select to anon, authenticated using (is_active);
create policy "Active subjects are public" on public.subjects for select to anon, authenticated using (is_active);

create policy "Users can read their own profile" on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "Admins can read profiles" on public.profiles for select to authenticated using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins can manage profiles" on public.profiles for all to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Faculty can read own subject assignments" on public.faculty_subjects for select to authenticated
  using (faculty_id = (select auth.uid()) or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins can manage subject assignments" on public.faculty_subjects for all to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Published resources are public; owners and admins can read theirs" on public.resources for select to anon, authenticated
  using (status = 'published' or uploaded_by = (select auth.uid()) or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Assigned faculty can create pending resources" on public.resources for insert to authenticated
  with check (
    uploaded_by = (select auth.uid()) and status in ('draft', 'pending_review') and
    ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' or exists (
      select 1 from public.faculty_subjects fs where fs.faculty_id = (select auth.uid()) and fs.subject_id = resources.subject_id
    ))
  );
create policy "Faculty can update own unreviewed resources" on public.resources for update to authenticated
  using (uploaded_by = (select auth.uid()) and status in ('draft', 'pending_review', 'rejected'))
  with check (uploaded_by = (select auth.uid()) and status in ('draft', 'pending_review', 'rejected'));
create policy "Admins can update resources" on public.resources for update to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Faculty can delete own unreviewed resources" on public.resources for delete to authenticated
  using ((uploaded_by = (select auth.uid()) and status in ('draft', 'pending_review', 'rejected')) or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Visible resource files follow resource visibility" on public.resource_files for select to anon, authenticated
  using (exists (select 1 from public.resources r where r.id = resource_id and (r.status = 'published' or r.uploaded_by = (select auth.uid()) or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')));
create policy "Owners and admins manage resource files" on public.resource_files for all to authenticated
  using (exists (select 1 from public.resources r where r.id = resource_id and ((r.uploaded_by = (select auth.uid()) and r.status in ('draft', 'pending_review', 'rejected')) or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')))
  with check (exists (select 1 from public.resources r where r.id = resource_id and ((r.uploaded_by = (select auth.uid()) and r.status in ('draft', 'pending_review', 'rejected')) or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')));

grant select on public.programs, public.semesters, public.subjects to anon, authenticated;
grant select, insert, update, delete on public.resources, public.resource_files to authenticated;
grant select on public.resources, public.resource_files to anon;
grant select, insert, update, delete on public.profiles, public.faculty_subjects to authenticated;

insert into public.programs (name, short_name, slug, category, accent, source_url, source_verified_on) values
('Artificial Intelligence and Machine Learning','AI & ML','artificial-intelligence-and-machine-learning','Computing','#a9c5ff','https://www.ldce.ac.in/admissions/ug-programs','2026-09-27'),
('Automobile Engineering','Automobile','automobile-engineering','Engineering','#ffb781','https://www.ldce.ac.in/admissions/ug-programs','2026-09-27'),
('Biomedical Engineering','Biomedical','biomedical-engineering','Engineering','#a9e2d0','https://www.ldce.ac.in/admissions/ug-programs','2026-09-27'),
('Chemical Engineering','Chemical','chemical-engineering','Engineering','#e6c1a4','https://www.ldce.ac.in/admissions/ug-programs','2026-09-27'),
('Civil Engineering','Civil','civil-engineering','Engineering','#d3c6ae','https://www.ldce.ac.in/admissions/ug-programs','2026-09-27'),
('Computer Engineering','Computer','computer-engineering','Computing','#a9c5ff','https://www.ldce.ac.in/admissions/ug-programs','2026-09-27'),
('Electrical Engineering','Electrical','electrical-engineering','Engineering','#f4d27c','https://www.ldce.ac.in/admissions/ug-programs','2026-09-27'),
('Electronics & Communication Engineering','E & C','electronics-and-communication-engineering','Computing','#bdc4fa','https://www.ldce.ac.in/admissions/ug-programs','2026-09-27'),
('Environment Engineering','Environment','environment-engineering','Engineering','#a9e2d0','https://www.ldce.ac.in/admissions/ug-programs','2026-09-27'),
('Information Technology','IT','information-technology','Computing','#a9c5ff','https://www.ldce.ac.in/admissions/ug-programs','2026-09-27'),
('Instrumentation & Control Engineering','I & C','instrumentation-and-control-engineering','Engineering','#d4b9ee','https://www.ldce.ac.in/admissions/ug-programs','2026-09-27'),
('Mechanical Engineering','Mechanical','mechanical-engineering','Engineering','#ffb781','https://www.ldce.ac.in/admissions/ug-programs','2026-09-27'),
('Plastic Technology','Plastic','plastic-technology','Engineering','#d3c6ae','https://www.ldce.ac.in/admissions/ug-programs','2026-09-27'),
('Robotics and Automation','Robotics','robotics-and-automation','Computing','#d4b9ee','https://www.ldce.ac.in/admissions/ug-programs','2026-09-27'),
('Rubber Technology','Rubber','rubber-technology','Engineering','#e6c1a4','https://www.ldce.ac.in/admissions/ug-programs','2026-09-27'),
('Textile Technology','Textile','textile-technology','Engineering','#f4d27c','https://www.ldce.ac.in/admissions/ug-programs','2026-09-27')
on conflict (slug) do update set name = excluded.name, short_name = excluded.short_name, category = excluded.category, accent = excluded.accent, source_url = excluded.source_url, source_verified_on = excluded.source_verified_on, is_active = true, updated_at = now();
