
CREATE POLICY "Public read thumbnails" ON storage.objects FOR SELECT USING (bucket_id = 'thumbnails');
CREATE POLICY "Auth upload thumbnails" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'thumbnails');
CREATE POLICY "Auth update thumbnails" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'thumbnails');
CREATE POLICY "Auth delete thumbnails" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'thumbnails');

CREATE POLICY "Public read videos" ON storage.objects FOR SELECT USING (bucket_id = 'videos');
CREATE POLICY "Auth upload videos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'videos');
CREATE POLICY "Auth update videos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'videos');
CREATE POLICY "Auth delete videos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'videos');
