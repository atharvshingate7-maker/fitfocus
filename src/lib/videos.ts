import { supabase } from "@/integrations/supabase/client";
import type { VideoCardData } from "@/components/VideoCard";

export async function fetchVideos(search?: string): Promise<VideoCardData[]> {
  let q = supabase
    .from("videos")
    .select("id,title,thumbnail_url,user_id,likes(user_id),comments(id)")
    .order("created_at", { ascending: false });
  if (search && search.trim()) q = q.ilike("title", `%${search.trim()}%`);
  const { data, error } = await q;
  if (error) throw error;
  const userIds = [...new Set((data ?? []).map((v: any) => v.user_id))];
  const { data: profiles } = await supabase.from("profiles").select("id,username").in("id", userIds);
  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p.username]));
  return (data ?? []).map((v: any) => ({
    id: v.id as string,
    title: v.title as string,
    thumbnail_url: v.thumbnail_url as string,
    creator: profileMap.get(v.user_id) ?? "Unknown",
    likes: v.likes?.length ?? 1,
    comments: v.comments?.length ?? 0,
  }));
}
