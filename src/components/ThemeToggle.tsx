import { Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 text-white hover:bg-transparent border border-transparent hover:border-blue-500 transition-colors"
      aria-label="Theme toggle"
      type="button"
    >
      <Sun className="h-6 w-6" strokeWidth={1.75} />
    </Button>
  );
}
