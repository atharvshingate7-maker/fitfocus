import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Dumbbell } from "lucide-react";

export const Route = createFileRoute("/")({ component: Welcome });

function Welcome() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/feed", replace: true });
  }, [user, loading, navigate]);

  return (
    <main className="relative flex min-h-screen flex-col bg-background animate-fade-in">
      <section className="flex flex-1 flex-col items-center justify-center px-6 pt-20 pb-12 text-center">
        <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Dumbbell className="h-6 w-6" strokeWidth={2.5} />
        </span>
        <h1 className="max-w-2xl text-balance text-4xl font-extrabold tracking-tight sm:text-6xl">
          FitnessTube
        </h1>
        <p className="mt-4 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
          The exclusive home for short-form fitness, workout, and nutrition videos.
        </p>

        <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
          <Button asChild size="lg" className="h-12 w-full rounded-full text-base font-semibold">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="h-12 w-full rounded-full text-base font-semibold border border-border">
            <Link to="/signup">Sign up</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
