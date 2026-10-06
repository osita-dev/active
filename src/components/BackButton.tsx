import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const cls =
  "-ml-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-foreground transition hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20";

/** Goes back in history when there is some; otherwise falls back to `to` (default: home). */
const BackButton = ({ to = "/", className }: { to?: string; className?: string }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasHistory = location.key !== "default";

  if (!hasHistory) {
    return (
      <Link to={to} aria-label="Back" className={cn(cls, className)}>
        <ArrowLeft className="h-6 w-6" />
      </Link>
    );
  }
  return (
    <button type="button" onClick={() => navigate(-1)} aria-label="Back" className={cn(cls, className)}>
      <ArrowLeft className="h-6 w-6" />
    </button>
  );
};

export default BackButton;
