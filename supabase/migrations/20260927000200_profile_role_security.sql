-- Roles live in the administrator-managed profiles table, never in user-editable JWT metadata.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.current_role()
returns public.portal_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles as p
  where p.user_id = (select auth.uid())
    and p.is_active = true
  limit 1
$$;

revoke all on function private.current_role() from public;
grant execute on function private.current_role() to authenticated;

create index if not exists profiles_program_idx on public.profiles(program_id);
create index if not exists resource_files_resource_idx on public.resource_files(resource_id);

drop policy if exists "Users can read their own profile" on public.profiles;
drop policy if exists "Admins can read profiles" on public.profiles;
drop policy if exists "Admins can manage profiles" on public.profiles;
create policy "Users can read their own profile" on public.profiles for select to authenticated
  using (user_id = (select auth.uid()) or (select private.current_role()) = 'admin');
create policy "Admins can insert profiles" on public.profiles for insert to authenticated
  with check ((select private.current_role()) = 'admin');
create policy "Admins can update profiles" on public.profiles for update to authenticated
  using ((select private.current_role()) = 'admin')
  with check ((select private.current_role()) = 'admin');
create policy "Admins can delete profiles" on public.profiles for delete to authenticated
  using ((select private.current_role()) = 'admin');

drop policy if exists "Faculty can read own subject assignments" on public.faculty_subjects;
create policy "Faculty can read own subject assignments" on public.faculty_subjects for select to authenticated
  using (faculty_id = (select auth.uid()) or (select private.current_role()) = 'admin');
drop policy if exists "Admins can manage subject assignments" on public.faculty_subjects;
create policy "Admins can insert subject assignments" on public.faculty_subjects for insert to authenticated
  with check ((select private.current_role()) = 'admin');
create policy "Admins can update subject assignments" on public.faculty_subjects for update to authenticated
  using ((select private.current_role()) = 'admin') with check ((select private.current_role()) = 'admin');
create policy "Admins can delete subject assignments" on public.faculty_subjects for delete to authenticated
  using ((select private.current_role()) = 'admin');

drop policy if exists "Admins can update resources" on public.resources;
drop policy if exists "Faculty can update own unreviewed resources" on public.resources;
create policy "Faculty or admins can update resources" on public.resources for update to authenticated
  using (
    (uploaded_by = (select auth.uid()) and (select private.current_role()) = 'faculty' and status in ('draft', 'pending_review', 'rejected'))
    or (select private.current_role()) = 'admin'
  )
  with check (
    (uploaded_by = (select auth.uid()) and (select private.current_role()) = 'faculty' and status in ('draft', 'pending_review', 'rejected'))
    or (select private.current_role()) = 'admin'
  );
drop policy if exists "Faculty can delete own unreviewed resources" on public.resources;
create policy "Faculty or admins can delete resources" on public.resources for delete to authenticated
  using (
    (uploaded_by = (select auth.uid()) and (select private.current_role()) = 'faculty' and status in ('draft', 'pending_review', 'rejected'))
    or (select private.current_role()) = 'admin'
  );
drop policy if exists "Assigned faculty can create pending resources" on public.resources;
create policy "Assigned faculty can create pending resources" on public.resources for insert to authenticated
  with check (
    uploaded_by = (select auth.uid())
    and status in ('draft', 'pending_review')
    and (
      (select private.current_role()) = 'admin' or
      ((select private.current_role()) = 'faculty' and exists (
        select 1 from public.faculty_subjects fs where fs.faculty_id = (select auth.uid()) and fs.subject_id = resources.subject_id
      ))
    )
  );

drop policy if exists "Published resources are public; owners and admins can read theirs" on public.resources;
create policy "Published resources are public; owners and admins can read theirs" on public.resources for select to anon, authenticated
  using (
    status = 'published'
    or (uploaded_by = (select auth.uid()) and (select private.current_role()) = 'faculty')
    or (select private.current_role()) = 'admin'
  );

drop policy if exists "Owners and admins manage resource files" on public.resource_files;
drop policy if exists "Visible resource files follow resource visibility" on public.resource_files;
create policy "Visible resource files follow resource visibility" on public.resource_files for select to anon, authenticated
  using (exists (
    select 1 from public.resources r where r.id = resource_id and (
      r.status = 'published'
      or (r.uploaded_by = (select auth.uid()) and (select private.current_role()) = 'faculty')
      or (select private.current_role()) = 'admin'
    )
  ));
create policy "Resource owners and admins can add files" on public.resource_files for insert to authenticated
  with check (exists (
    select 1 from public.resources r where r.id = resource_id and
    ((r.uploaded_by = (select auth.uid()) and (select private.current_role()) = 'faculty' and r.status in ('draft', 'pending_review', 'rejected')) or (select private.current_role()) = 'admin')
  ));
create policy "Resource owners and admins can update files" on public.resource_files for update to authenticated
  using (exists (
    select 1 from public.resources r where r.id = resource_id and
    ((r.uploaded_by = (select auth.uid()) and (select private.current_role()) = 'faculty' and r.status in ('draft', 'pending_review', 'rejected')) or (select private.current_role()) = 'admin')
  ))
  with check (exists (
    select 1 from public.resources r where r.id = resource_id and
    ((r.uploaded_by = (select auth.uid()) and (select private.current_role()) = 'faculty' and r.status in ('draft', 'pending_review', 'rejected')) or (select private.current_role()) = 'admin')
  ));
create policy "Resource owners and admins can delete files" on public.resource_files for delete to authenticated
  using (exists (
    select 1 from public.resources r where r.id = resource_id and
    ((r.uploaded_by = (select auth.uid()) and (select private.current_role()) = 'faculty' and r.status in ('draft', 'pending_review', 'rejected')) or (select private.current_role()) = 'admin')
  ));

drop policy if exists "Admins can manage programs" on public.programs;
create policy "Admins can manage programs" on public.programs for all to authenticated
  using ((select private.current_role()) = 'admin') with check ((select private.current_role()) = 'admin');
create policy "Admins can manage semesters" on public.semesters for all to authenticated
  using ((select private.current_role()) = 'admin') with check ((select private.current_role()) = 'admin');
create policy "Admins can manage subjects" on public.subjects for all to authenticated
  using ((select private.current_role()) = 'admin') with check ((select private.current_role()) = 'admin');

grant insert, update, delete on public.programs, public.semesters, public.subjects to authenticated;
