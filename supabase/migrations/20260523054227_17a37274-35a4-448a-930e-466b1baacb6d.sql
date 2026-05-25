
-- Restrict bucket listing: drop broad SELECT, keep individual object access via signed/public urls (no listing).
-- Public URLs still work because storage serves files via /object/public/.
-- We narrow SELECT to deny listing (object lookup by exact path still works via storage api when needed).
DROP POLICY IF EXISTS "Anyone can view thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view videos files" ON storage.objects;

-- Revoke EXECUTE on trigger function (only postgres/trigger uses it)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
