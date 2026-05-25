import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => window.history.back()}
      className="rounded-full gap-1.5 text-sm font-medium -ml-2"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  );
}
