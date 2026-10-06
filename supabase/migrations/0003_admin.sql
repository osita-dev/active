-- Admin support: allow a 'admin' role on profiles, and give admins read/update on reports
-- and suspend rights on providers. Set one user's role to 'admin' manually in SQL.

alter table profiles drop constraint profiles_role_check;
alter table profiles add constraint profiles_role_check check (role in ('seeker','provider','both','admin'));

create policy "reports: admin read all" on reports for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "reports: admin update" on reports for update
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "providers: admin update" on providers for update
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
