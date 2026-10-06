import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Info, MapPin, MessageCircle, Phone } from "lucide-react";
import { getProvider, getProviderRating, type Provider } from "@/lib/providers";
import ReportButton from "@/components/ReportButton";
import RateProvider from "@/components/RateProvider";
import PageHeader from "@/components/PageHeader";
import ProviderAvatar from "@/components/ProviderAvatar";
import { RatingLine, VerifiedBadge } from "@/components/ProviderBits";
import MapIllustration from "@/components/Illustrations";
import { WhatsAppIcon } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";

const ProviderPage = () => {
  const { id } = useParams();
  const [p, setP] = useState<Provider | null | undefined>(undefined);
  const [rating, setRating] = useState<{ average: number; count: number } | null>(null);

  useEffect(() => {
    if (!id) return;
    getProvider(id).then(setP);
    getProviderRating(id).then(setRating);
  }, [id]);

  if (p === undefined)
    return (
      <div className="min-h-dvh bg-background">
        <div className="mx-auto w-full max-w-4xl space-y-5 px-5 pt-6 md:px-8" aria-busy="true" aria-label="Loading provider">
          <Skeleton className="h-11 w-11 rounded-full bg-border/70" />
          <div className="surface flex gap-5 p-6">
            <Skeleton className="h-24 w-24 rounded-2xl bg-border/70" />
            <div className="flex-1 space-y-3 pt-2">
              <Skeleton className="h-5 w-1/2 bg-border/70" />
              <Skeleton className="h-4 w-2/3 bg-border/70" />
              <Skeleton className="h-4 w-1/3 bg-border/70" />
            </div>
          </div>
          <Skeleton className="h-14 w-full rounded-2xl bg-border/70" />
        </div>
      </div>
    );

  if (p === null)
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-center">
        <MapIllustration detailed className="max-w-xs" />
        <h1 className="mt-4 text-2xl font-extrabold">This provider isn't available</h1>
        <p className="mt-2 max-w-sm text-muted-foreground">They may have paused their listing or the link is out of date.</p>
        <Link to="/" className="btn btn-primary mt-7 w-full max-w-xs">
          FIND ANOTHER PROVIDER
        </Link>
      </div>
    );

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto w-full max-w-4xl px-5 pb-16 pt-5 md:px-8 md:pt-8">
        <PageHeader title="Provider" className="mb-5 [&_h1]:sr-only" />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6">
          {/* identity */}
          <section className="surface p-5 sm:p-6 lg:col-start-1">
            <div className="flex items-start gap-4 sm:gap-5">
              <ProviderAvatar name={p.business_name} src={p.photo_url} size={88} className="sm:h-24 sm:w-24" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-balance text-xl font-extrabold leading-tight text-foreground sm:text-2xl">{p.business_name}</h2>
                  <VerifiedBadge className="h-5 w-5" />
                </div>
                {p.categories.length > 0 && <p className="mt-1 text-[15px] text-muted-foreground">{p.categories.join(" · ")}</p>}
                <p className="mt-1.5 flex items-center gap-1.5 text-[15px] text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="min-w-0 break-words">{p.areas[0] ?? "Area not specified"}</span>
                </p>
                <div className="mt-1.5">
                  {rating ? <RatingLine average={rating.average} count={rating.count} /> : <Skeleton className="h-4 w-28 bg-border/70" />}
                </div>
              </div>
            </div>

            {p.description && <p className="mt-5 text-[15px] leading-relaxed text-foreground/80">{p.description}</p>}

            {p.areas.length > 0 && (
              <div className="mt-5">
                <h3 className="text-sm font-bold text-foreground">Works in</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {p.areas.map((a) => (
                    <span key={a} className="chip-tag">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* the one primary action, then two quieter ones */}
          <section className="surface space-y-3 p-5 sm:p-6 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:self-start lg:sticky lg:top-6">
            <Link to={`/chat/new/${p.id}`} className="btn btn-primary w-full text-base">
              <MessageCircle className="h-5 w-5" aria-hidden />
              MESSAGE
            </Link>
            <div className="flex gap-3">
              <a href={`tel:${p.phone}`} className="btn btn-outline min-h-[48px] flex-1 px-3">
                <Phone className="h-[18px] w-[18px]" aria-hidden />
                CALL
              </a>
              {p.whatsapp && (
                <a
                  href={`https://wa.me/${p.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline min-h-[48px] flex-1 px-3"
                >
                  <WhatsAppIcon className="h-[18px] w-[18px]" />
                  WhatsApp
                </a>
              )}
            </div>
            <p className="flex items-start gap-2 pt-1 text-[13px] leading-snug text-muted-foreground">
              <Info className="mt-px h-4 w-4 shrink-0" aria-hidden />
              Ratings are available after messaging this provider.
            </p>
          </section>

          <div className="space-y-5 lg:col-start-1">
            <ReportButton providerId={p.id} />
            <RateProvider providerId={p.id} onRated={() => getProviderRating(p.id).then(setRating)} />
          </div>
        </div>
      </div>
    </div>
  );
};


export default ProviderPage;
