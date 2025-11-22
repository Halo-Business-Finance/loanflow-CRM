import { Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  // Dark mode is temporarily disabled to keep the CRM layout stable and consistent
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 text-white hover:bg-transparent rounded group"
      aria-label="Theme toggle (light mode only)"
      type="button"
    >
      <span className="inline-flex p-0.5 rounded border border-transparent group-hover:border-blue-500 transition-colors duration-200">
        <Sun className="h-6 w-6" strokeWidth={1.75} />
      </span>
    </Button>
  );
}
