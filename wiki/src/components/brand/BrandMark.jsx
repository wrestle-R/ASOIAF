import { cn } from "@/lib/utils";

export function BrandMark({ className, decorative = true }) {
  return (
    <img
      className={cn("brand-mark", className)}
      src="/brand-mark.svg"
      alt={decorative ? "" : "Map of Ice and Fire"}
      width="48"
      height="48"
      aria-hidden={decorative || undefined}
    />
  );
}
