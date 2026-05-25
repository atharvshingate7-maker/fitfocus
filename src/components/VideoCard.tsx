import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle } from "lucide-react";

export interface VideoCardData {
  id: string;
  title: string;
  thumbnail_url: string;
  creator: string;
  likes: number;
  comments: number;
}

export function VideoCard({ v }: { v: VideoCardData }) {
  return (
    <Link
      to="/video/$id"
      params={{ id: v.id }}
      className="group block"
    >
      <div className="aspect-video w-full overflow-hidden rounded-3xl bg-muted">
        <img
          src={v.thumbnail_url}
          alt={v.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="mt-3 px-1">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{v.title}</h3>
        <div className="mt-1 text-xs text-muted-foreground">{v.creator}</div>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{v.likes}</span>
          <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{v.comments}</span>
        </div>
      </div>
    </Link>
  );
}
