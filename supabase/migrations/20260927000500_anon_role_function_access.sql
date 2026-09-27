-- The role helper returns no role for unauthenticated callers and is used in policies
-- that also serve public reads. Granting EXECUTE avoids permission errors on those rows.
grant usage on schema private to anon;
grant execute on function private.current_role() to anon;
