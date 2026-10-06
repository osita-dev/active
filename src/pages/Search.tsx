import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle, ArrowRight, MapPin, Search as SearchIcon, X } from "lucide-react";
import { searchProviders, type SearchResult } from "@/lib/providers";
import PageHeader from "@/components/PageHeader";
import ProviderAvatar from "@/components/ProviderAvatar";
import { RatingLine, VerifiedBadge } from "@/components/ProviderBits";
import MapIllustration from "@/components/Illustrations";
import { Skeleton } from "@/components/ui/skeleton";

const FilterPill = ({ icon: Icon, label }: { icon: typeof SearchIcon; label: string }) => (
  <div className="field min-h-[48px] min-w-0 flex-1 gap-2.5 px-3.5">
    <Icon className="h-[18px] w-[18px] shrink-0 text-muted-foreground" aria-hidden />
    <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-foreground/80">{label}</span>
    <Link
      to="/"
      aria-label={`Change ${label}`}
      className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
    >
      <X className="h-4 w-4" />
    </Link>
  </div>
);

const ResultCard = ({ p }: { p: SearchResult }) => {
  const where = [p.distanceKm != null ? `${p.distanceKm.toFixed(1)} km away` : null, p.areas.join(", ") || null]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      to={`/provider/${p.id}`}
      className="group flex gap-4 rounded-3xl border border-border/80 bg-card p-4 shadow-card transition duration-200 hover:border-primary/40 hover:shadow-pop focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
    >
      <ProviderAvatar name={p.business_name} src={p.photo_url} size={80} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate text-[17px] font-bold leading-snug text-foreground">{p.business_name}</h3>
          <VerifiedBadge />
        </div>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">{p.categories.join(" · ") || "Service provider"}</p>
        {where && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">{where}</span>
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-3">
          <RatingLine average={p.ratingAvg} count={p.ratingCount} />
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-sm font-bold text-primary-foreground shadow-cta transition group-hover:bg-primary/90">
            View profile
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
};

const ResultSkeleton = () => (
  <div className="flex gap-4 rounded-3xl border border-border/80 bg-card p-4">
    <Skeleton className="h-20 w-20 shrink-0 rounded-2xl bg-border/70" />
    <div className="flex-1 space-y-2.5 pt-1">
      <Skeleton className="h-4 w-3/5 bg-border/70" />
      <Skeleton className="h-3.5 w-4/5 bg-border/70" />
      <Skeleton className="h-3.5 w-2/5 bg-border/70" />
    </div>
  </div>
);

const Search = () => {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const area = params.get("area") ?? undefined;
  const lat = params.get("lat") ? Number(params.get("lat")) : undefined;
  const lng = params.get("lng") ? Number(params.get("lng")) : undefined;

  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setResults(null);
    setError(null);
    searchProviders({ query: q, area, userLat: lat, userLng: lng })
      .then((r) => alive && setResults(r))
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [q, area, lat, lng]);

  const title = `${q.charAt(0).toUpperCase()}${q.slice(1)} ${area ? `around ${area}` : "near you"}`;

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-5 md:px-8 md:pt-8">
        <PageHeader
          title={title}
          subtitle={results ? `${results.length} ${results.length === 1 ? "provider" : "providers"} found` : undefined}
        />

        <div className="mt-5 flex gap-3 md:max-w-xl">
          <FilterPill icon={SearchIcon} label={q} />
          {area && <FilterPill icon={MapPin} label={area} />}
        </div>

        {error && (
          <div role="alert" className="alert-error mt-6">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <div className="flex-1">
              <p>Something went wrong while searching.</p>
              <p className="mt-0.5 font-normal opacity-80">{error}</p>
              <button onClick={() => window.location.reload()} className="mt-2 font-bold underline underline-offset-4">
                Try again
              </button>
            </div>
          </div>
        )}

        {results === null && !error && (
          <div className="mt-6 grid gap-4 md:grid-cols-2" aria-busy="true" aria-label="Searching">
            {[0, 1, 2, 3].map((i) => (
              <ResultSkeleton key={i} />
            ))}
          </div>
        )}

        {results && results.length === 0 && (
          <div className="mx-auto mt-6 flex max-w-md flex-col items-center px-2 pb-6 pt-4 text-center md:mt-10">
            <MapIllustration detailed className="max-w-xs" />
            <h2 className="mt-4 text-balance text-2xl font-extrabold leading-tight text-foreground">No providers found for {q} yet.</h2>
            <p className="mt-2 text-muted-foreground">Try a nearby area or check back soon.</p>
            <Link to="/" className="btn btn-primary mt-7 w-full">
              CHANGE SEARCH
            </Link>
          </div>
        )}

        {results && results.length > 0 && (
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {results.map((p) => (
              <li key={p.id} className="flex">
                <div className="w-full">
                  <ResultCard p={p} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Search;
