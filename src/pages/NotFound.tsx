import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import MapIllustration from "@/components/Illustrations";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 pb-12 text-center">
      <MapIllustration detailed className="max-w-xs" />
      <h1 className="mt-4 text-3xl font-extrabold text-foreground">We couldn't find that page</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">The link may be old or mistyped. Let's get you back to finding help.</p>
      <Link to="/" className="btn btn-primary mt-7 w-full max-w-xs">
        BACK TO SEARCH
      </Link>
    </div>
  );
};

export default NotFound;
