-- Keep public reads and admin mutations in separate policies to avoid redundant policy checks.
drop policy if exists "Active programs are public" on public.programs;
create policy "Public and admin programs are visible" on public.programs for select to anon, authenticated
  using (is_active or (select private.current_role()) = 'admin');
drop policy if exists "Admins can manage programs" on public.programs;
create policy "Admins can insert programs" on public.programs for insert to authenticated
  with check ((select private.current_role()) = 'admin');
create policy "Admins can update programs" on public.programs for update to authenticated
  using ((select private.current_role()) = 'admin') with check ((select private.current_role()) = 'admin');
create policy "Admins can delete programs" on public.programs for delete to authenticated
  using ((select private.current_role()) = 'admin');

drop policy if exists "Active semesters are public" on public.semesters;
drop policy if exists "Admins can manage semesters" on public.semesters;
create policy "Public and admin semesters are visible" on public.semesters for select to anon, authenticated
  using (is_active or (select private.current_role()) = 'admin');
create policy "Admins can insert semesters" on public.semesters for insert to authenticated
  with check ((select private.current_role()) = 'admin');
create policy "Admins can update semesters" on public.semesters for update to authenticated
  using ((select private.current_role()) = 'admin') with check ((select private.current_role()) = 'admin');
create policy "Admins can delete semesters" on public.semesters for delete to authenticated
  using ((select private.current_role()) = 'admin');

drop policy if exists "Active subjects are public" on public.subjects;
drop policy if exists "Admins can manage subjects" on public.subjects;
create policy "Public and admin subjects are visible" on public.subjects for select to anon, authenticated
  using (is_active or (select private.current_role()) = 'admin');
create policy "Admins can insert subjects" on public.subjects for insert to authenticated
  with check ((select private.current_role()) = 'admin');
create policy "Admins can update subjects" on public.subjects for update to authenticated
  using ((select private.current_role()) = 'admin') with check ((select private.current_role()) = 'admin');
create policy "Admins can delete subjects" on public.subjects for delete to authenticated
  using ((select private.current_role()) = 'admin');
