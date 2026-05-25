import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/Navbar";
import { BackButton } from "@/components/BackButton";
import { Upload, Loader2 } from "lucide-react";

export const Route = createFileRoute("/upload")({ component: UploadPage });

function UploadPage() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-lg px-4 py-12 text-center sm:px-6">
          <BackButton />
          <h1 className="mt-4 text-2xl font-bold">Sign in required</h1>
          <p className="mt-2 text-muted-foreground">You need to be signed in to upload a video.</p>
          <Button asChild className="mt-6 rounded-full"><Link to="/login">Sign in</Link></Button>
        </main>
      </div>
    );
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!thumbnailFile) { toast.error("Thumbnail is required"); return; }
    if (!videoFile) { toast.error("Video file is required"); return; }
    setBusy(true);
    try {
      const thumbExt = thumbnailFile.name.split(".").pop() || "jpg";
      const thumbPath = `${user.id}/${Date.now()}_thumb.${thumbExt}`;
      const { data: thumbData, error: thumbErr } = await supabase.storage.from("thumbnails").upload(thumbPath, thumbnailFile, { upsert: true });
      if (thumbErr) throw thumbErr;
      const { data: thumbUrl } = supabase.storage.from("thumbnails").getPublicUrl(thumbData?.path || thumbPath);

      const vidExt = videoFile.name.split(".").pop() || "mp4";
      const vidPath = `${user.id}/${Date.now()}_video.${vidExt}`;
      const { data: vidData, error: vidErr } = await supabase.storage.from("videos").upload(vidPath, videoFile, { upsert: true, contentType: videoFile.type });
      if (vidErr) throw vidErr;
      const { data: vidUrl } = supabase.storage.from("videos").getPublicUrl(vidData?.path || vidPath);

      const { error: dbErr } = await supabase.from("videos").insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        thumbnail_url: thumbUrl.publicUrl,
        video_url: vidUrl.publicUrl,
      });
      if (dbErr) throw dbErr;

      toast.success("Video uploaded!");
      setTitle(""); setDescription(""); setThumbnailFile(null); setVideoFile(null);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-4 sm:px-6">
        <BackButton />
        <div className="mt-4 rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight">Upload a workout</h1>
          <p className="mt-1 text-sm text-muted-foreground">Share your fitness video with the community.</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="h-11 rounded-full px-4" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[5rem] rounded-2xl resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="thumb">Thumbnail image</Label>
              <Input id="thumb" type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)} className="h-auto rounded-full px-4 py-2.5" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="video">Video file</Label>
              <Input id="video" type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)} className="h-auto rounded-full px-4 py-2.5" required />
            </div>
            <Button type="submit" disabled={busy} className="h-12 w-full rounded-full text-base font-semibold">
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {busy ? "Uploading..." : "Upload video"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
