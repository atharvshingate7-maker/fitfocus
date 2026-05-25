import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { BackButton } from "@/components/BackButton";
import { useAuth } from "@/lib/auth";
import { getVideoDetail, getVideoLiked, toggleLike, postComment } from "@/lib/videos.functions";
import { useServerFn } from "@tanstack/react-start";
import { fetchVideos } from "@/lib/videos";
import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/video/$id")({
  component: VideoDetail,
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <p className="text-muted-foreground">{error.message}</p>
      </main>
    </div>
  ),
});

interface DetailData {
  video: {
    id: string; title: string; description: string | null;
    thumbnail_url: string; video_url: string; user_id: string;
    creator: string; avatar: string | null | undefined; likes: number;
  };
  comments: { id: string; content: string; created_at: string; creator: string }[];
}

function VideoDetail() {
  const { id } = useParams({ from: Route.id });
  const { user } = useAuth();
  const qc = useQueryClient();
  const [comment, setComment] = useState("");

  const fetchVideo = useServerFn(getVideoDetail);
  const { data, isLoading } = useQuery<DetailData>({
    queryKey: ["video", id],
    queryFn: async () => fetchVideo({ data: { id } }) as unknown as DetailData,
  });

  const { data: suggestions } = useQuery({
    queryKey: ["videos"],
    queryFn: () => fetchVideos(),
  });
  const suggested = (suggestions ?? []).filter((v) => v.id !== id).slice(0, 8);

  const fetchLiked = useServerFn(getVideoLiked);
  const { data: likedData } = useQuery({
    queryKey: ["video-liked", id],
    queryFn: async () => fetchLiked({ data: { videoId: id } }).catch(() => ({ liked: false })),
    enabled: !!user,
  });

  const doLike = useServerFn(toggleLike);
  const likeMutation = useMutation({
    mutationFn: (vars: { data: { videoId: string } }) => doLike(vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["video", id] });
      qc.invalidateQueries({ queryKey: ["video-liked", id] });
    },
  });

  const doComment = useServerFn(postComment);
  const commentMutation = useMutation({
    mutationFn: (vars: { data: { videoId: string; content: string } }) => doComment(vars),
    onSuccess: () => {
      setComment("");
      qc.invalidateQueries({ queryKey: ["video", id] });
    },
  });

  const onLike = () => {
    if (!user) { toast.info("Sign in to like videos"); return; }
    likeMutation.mutate({ data: { videoId: id } });
  };

  const onComment = () => {
    if (!user) { toast.info("Sign in to comment"); return; }
    if (!comment.trim()) return;
    commentMutation.mutate({ data: { videoId: id, content: comment } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="aspect-video animate-pulse rounded-3xl bg-muted" />
          <div className="mt-6 h-6 w-1/3 animate-pulse rounded-full bg-muted" />
          <div className="mt-3 h-4 w-1/4 animate-pulse rounded-full bg-muted" />
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <p className="text-muted-foreground">Video not found.</p>
        </main>
      </div>
    );
  }

  const { video, comments } = data;

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <BackButton />
        <div className="mt-2 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
        <div className="aspect-video w-full overflow-hidden rounded-3xl bg-muted">
          <video
            src={video.video_url}
            poster={video.thumbnail_url}
            controls
            className="h-full w-full object-cover"
          />
        </div>

        <div className="mt-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{video.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{video.description || "No description."}</p>
          </div>
          <div className="flex items-center gap-2 shrink-1">
            <Avatar className="h-8 w-8 border border-border">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {(video.creator || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{video.creator}</span>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4 border-b border-border pb-6">
          <Button
            onClick={onLike}
            variant="secondary"
            className={`rounded-full gap-2 ${likedData?.liked ? "bg-rose-500 text-white hover:bg-rose-600" : ""}`}
          >
            <Heart className="h-4 w-4" fill={likedData?.liked ? "currentColor" : "none"} />
            <span>{video.likes}</span>
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageCircle className="h-4 w-4" />
            <span>{comments.length} comments</span>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Comments</h2>
          {user && (
            <div className="mt-4 flex items-start gap-3">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="min-h-[5rem] flex-1 rounded-2xl resize-none"
              />
              <Button onClick={onComment} size="sm" className="mt-1 rounded-full">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="mt-4 space-y-4">
            {comments.map((c: any) => (
              <div key={c.id} className="flex gap-3 rounded-2xl border border-border bg-card p-4">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarFallback className="bg-muted text-xs font-semibold">{(c.creator || "U").charAt(1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-semibold">{c.creator}</div>
                  <p className="mt-0.5 text-sm text-foreground">{c.content}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
            )}
          </div>
        </div>
        </div>

        <aside className="lg:col-span-1">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Up next</h2>
          <div className="mt-4 space-y-3">
            {suggested.length === 0 && (
              <p className="text-sm text-muted-foreground">No suggestions yet.</p>
            )}
            {suggested.map((s) => (
              <Link
                key={s.id}
                to="/video/$id"
                params={{ id: s.id }}
                className="group flex gap-3 rounded-2xl p-2 transition-colors hover:bg-muted"
              >
                <div className="aspect-video w-40 shrink-0 overflow-hidden rounded-2xl bg-muted">
                  <img
                    src={s.thumbnail_url}
                    alt={s.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{s.title}</h3>
                  <div className="mt-1 text-xs text-muted-foreground">{s.creator}</div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Heart className="h-3 w-3" />{s.likes}</span>
                    <span className="inline-flex items-center gap-1"><MessageCircle className="h-3 w-3" />{s.comments}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </aside>
        </div>
      </main>
    </div>
  );
}
