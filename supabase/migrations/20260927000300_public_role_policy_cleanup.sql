-- Finish moving authorization from JWT claims to the administrator-managed profile row.
drop policy if exists "Faculty can read own subject assignments" on public.faculty_subjects;
create policy "Faculty can read own subject assignments" on public.faculty_subjects for select to authenticated
  using (faculty_id = (select auth.uid()) or (select private.current_role()) = 'admin');

drop policy if exists "Published resources are public; owners and admins can read theirs" on public.resources;
create policy "Published resources are public; owners and admins can read theirs" on public.resources for select to anon, authenticated
  using (
    status = 'published'
    or (uploaded_by = (select auth.uid()) and (select private.current_role()) = 'faculty')
    or (select private.current_role()) = 'admin'
  );

drop policy if exists "Visible resource files follow resource visibility" on public.resource_files;
create policy "Visible resource files follow resource visibility" on public.resource_files for select to anon, authenticated
  using (exists (
    select 1 from public.resources r where r.id = resource_id and (
      r.status = 'published'
      or (r.uploaded_by = (select auth.uid()) and (select private.current_role()) = 'faculty')
      or (select private.current_role()) = 'admin'
    )
  ));
