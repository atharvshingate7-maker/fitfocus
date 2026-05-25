import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function stripVideo(v: any) {
  return {
    id: v.id as string,
    title: v.title as string,
    thumbnail_url: v.thumbnail_url as string,
    creator: v.profiles?.username ?? "Unknown",
    likes: v.likes?.length ?? 1,
    comments: v.comments?.length ?? 0,
  };
}

export const listVideos = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("videos")
      .select("id,title,thumbnail_url,user_id,likes(user_id),comments(id)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const { data: profiles } = await supabaseAdmin.from("profiles").select("id,username");
    const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p.username]));
    return (data ?? []).map((v: any) => ({
      id: v.id as string,
      title: v.title as string,
      thumbnail_url: v.thumbnail_url as string,
      creator: profileMap.get(v.user_id) ?? "Unknown",
      likes: v.likes?.length ?? 1,
      comments: v.comments?.length ?? 0,
    }));
  });

export const searchVideos = createServerFn({ method: "GET" })
  .inputValidator((input: { q: string }) => input)
  .handler(async ({ data }) => {
    let q = supabaseAdmin
      .from("videos")
      .select("id,title,thumbnail_url,user_id,likes(user_id),comments(id)")
      .order("created_at", { ascending: false });
    if (data.q.trim()) q = q.ilike("title", `%${data.q.trim()}%`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const { data: profiles } = await supabaseAdmin.from("profiles").select("id,username");
    const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p.username]));
    return (rows ?? []).map((v: any) => ({
      id: v.id as string,
      title: v.title as string,
      thumbnail_url: v.thumbnail_url as string,
      creator: profileMap.get(v.user_id) ?? "Unknown",
      likes: v.likes?.length ?? 1,
      comments: v.comments?.length ?? 0,
    }));
  });

export const getVideoDetail = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { data: video, error } = await supabaseAdmin
      .from("videos")
      .select("*,likes(user_id)")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("username,avatar_url")
      .eq("id", video.user_id)
      .single();

    const { data: commentsRaw } = await supabaseAdmin
      .from("comments")
      .select("*,profiles(username)")
      .eq("video_id", data.id)
      .order("created_at", { ascending: false });

    return {
      video: {
        id: video.id,
        title: video.title,
        description: video.description,
        thumbnail_url: video.thumbnail_url,
        video_url: video.video_url,
        user_id: video.user_id,
        creator: profile?.username ?? "Unknown",
        avatar: profile?.avatar_url,
        likes: video.likes?.length ?? 1,
      },
      comments: (commentsRaw ?? []).map((c: any) => ({
        id: c.id,
        content: c.content,
        created_at: c.created_at,
        creator: c.profiles?.username ?? "Unknown",
      })),
    };
  });

export const getVideoLiked = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { videoId: string }) => input)
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: row, error } = await supabaseAdmin
      .from("likes")
      .select("*")
      .eq("user_id", userId)
      .eq("video_id", data.videoId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { liked: !!row };
  });

export const toggleLike = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { videoId: string }) => input)
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: existing } = await supabaseAdmin
      .from("likes")
      .select("*")
      .eq("user_id", userId)
      .eq("video_id", data.videoId)
      .maybeSingle();
    if (existing) {
      await supabaseAdmin.from("likes").delete().eq("user_id", userId).eq("video_id", data.videoId);
      return { liked: false };
    }
    await supabaseAdmin.from("likes").insert({ user_id: userId, video_id: data.videoId });
    return { liked: true };
  });

export const postComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { videoId: string; content: string }) => input)
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: row, error } = await supabaseAdmin
      .from("comments")
      .insert({ user_id: userId, video_id: data.videoId, content: data.content.trim() })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    const { data: profile } = await supabaseAdmin
      .from("profiles").select("username").eq("id", userId).single();
    return {
      comment: {
        id: row.id,
        content: row.content,
        created_at: row.created_at,
        creator: profile?.username ?? "Unknown",
      },
    };
  });
