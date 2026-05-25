import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { VideoCard } from "@/components/VideoCard";
import { fetchVideos } from "@/lib/videos";
import { Dumbbell } from "lucide-react";

export const Route = createFileRoute("/feed")({ component: FeedPage });

function FeedPage() {
  const { data, isLoading } = useQuery({ queryKey: ["videos"], queryFn: () => fetchVideos() });

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Latest workouts</h1>

        {isLoading ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-video animate-pulse rounded-3xl bg-muted" />
            ))}
          </div>
        ) : (data?.length ?? 0) === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {data!.map((v) => <VideoCard key={v.id} v={v} />)}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-16 flex flex-col items-center justify-center text-center">
      <div className="flex h-40 w-40 items-center justify-center rounded-full bg-muted">
        <Dumbbell className="h-16 w-16 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <p className="mt-6 text-lg font-semibold">Upload a workout. Become the first.</p>
    </div>
  );
}
