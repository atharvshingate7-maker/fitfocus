import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Navbar } from "@/components/Navbar";
import { BackButton } from "@/components/BackButton";
import { VideoCard } from "@/components/VideoCard";
import { fetchVideos } from "@/lib/videos";

const searchSchema = z.object({ q: z.string().optional().default("") });

export const Route = createFileRoute("/search")({
  validateSearch: (s) => searchSchema.parse(s),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const { data, isLoading } = useQuery({
    queryKey: ["videos", "search", q],
    queryFn: () => fetchVideos(q),
  });

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <BackButton />
        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          Results for <span className="italic">"{q}"</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isLoading ? "Searching..." : `${data?.length ?? 0} videos found`}
        </p>

        {!isLoading && (data?.length ?? 0) === 0 ? (
          <div className="mt-16 text-center text-muted-foreground">No videos match your search.</div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {(data ?? []).map((v) => <VideoCard key={v.id} v={v} />)}
          </div>
        )}
      </main>
    </div>
  );
}
