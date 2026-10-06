import { BadgeCheck, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export const VerifiedBadge = ({ className }: { className?: string }) => (
  <BadgeCheck
    className={cn("h-[18px] w-[18px] shrink-0 fill-primary text-white", className)}
    aria-label="Active listing"
    role="img"
  />
);

/**
 * Social proof. Averages with fewer than 3 ratings are not shown (same rule as
 * the profile page) so one review can never make or break a provider.
 */
export const RatingLine = ({ average, count, className }: { average?: number; count?: number; className?: string }) => {
  if (count !== undefined && count >= 3 && average) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-sm text-muted-foreground", className)}>
        <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
        <span className="font-semibold text-foreground">{average.toFixed(1)}</span>
        <span>({count} ratings)</span>
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm text-muted-foreground", className)}>
      <Sparkles className="h-4 w-4 text-primary" aria-hidden />
      <span className="font-medium">New on Active</span>
    </span>
  );
};
