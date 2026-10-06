import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

type LogoProps = {
  /** "wordmark" = Active.   |   "pin" = 📍 Active (used on auth + dashboard) */
  variant?: "wordmark" | "pin";
  className?: string;
  asLink?: boolean;
};

const Logo = ({ variant = "wordmark", className, asLink = true }: LogoProps) => {
  const inner =
    variant === "pin" ? (
      <span className={cn("inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight", className)}>
        <MapPin className="h-6 w-6 fill-primary text-primary" strokeWidth={1.5} aria-hidden />
        Active
      </span>
    ) : (
      <span className={cn("text-[1.7rem] font-extrabold leading-none tracking-tight", className)}>
        Active<span className="text-primary">.</span>
      </span>
    );

  if (!asLink) return inner;
  return (
    <Link to="/" aria-label="Active — home" className="rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25">
      {inner}
    </Link>
  );
};

export default Logo;
