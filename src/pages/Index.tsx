import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Check, Loader2, LocateFixed, MapPin, MessageCircle, Search, Star } from "lucide-react";
import { useGeolocation } from "@/hooks/use-geolocation";
import Logo from "@/components/Logo";
import MapIllustration from "@/components/Illustrations";

// Recognition beats recall: a blank search box is the biggest drop-off point,
// so we offer common starting points the person can tap instead of typing.
const QUICK_PICKS = ["Electrician", "Plumber", "Hair stylist", "Mechanic", "Cleaner", "Generator repair"];

const TRUST_POINTS = [
  { icon: Search, title: "No account to browse", text: "Search first. Sign in only when you want to message someone." },
  { icon: MessageCircle, title: "Message before you commit", text: "Ask questions and agree details in chat, or call directly." },
  { icon: Star, title: "Ratings from real chats", text: "Only people who messaged a provider can rate them." },
];

const Index = () => {
  const [service, setService] = useState("");
  const [area, setArea] = useState("");
  const { state: geo, request: locate } = useGeolocation();
  const navigate = useNavigate();
  const areaRef = useRef<HTMLInputElement>(null);

  const canSearch = service.trim().length > 0;

  const search = () => {
    const params = new URLSearchParams();
    params.set("q", service.trim());
    if (area.trim()) params.set("area", area.trim());
    if (geo.status === "ok") {
      params.set("lat", String(geo.lat));
      params.set("lng", String(geo.lng));
    }
    navigate(`/search?${params.toString()}`);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (canSearch) search();
  };

  const pick = (label: string) => {
    setService(label);
    areaRef.current?.focus();
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      {/* soft light behind the hero — depth without a heavy gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-primary/10 blur-3xl md:h-[30rem] md:w-[30rem]"
      />

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-5 pb-2 pt-5 md:px-8 md:pt-7">
        <Logo />
        <nav className="flex items-center gap-6 text-[15px] font-semibold">
          <Link to="/become-provider" className="hidden rounded-md text-foreground/80 transition hover:text-primary sm:inline">
            List your service
          </Link>
          <Link to="/login" className="rounded-md text-muted-foreground transition hover:text-foreground">
            Sign in
          </Link>
        </nav>
      </header>

      <main className="relative mx-auto grid w-full max-w-6xl gap-8 px-5 pb-14 pt-8 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:items-center md:gap-14 md:px-8 md:pb-20 md:pt-14 lg:pt-20">
        <section>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-balance text-[2.6rem] font-extrabold leading-[1.04] text-foreground sm:text-5xl lg:text-[3.6rem]">
                What do you need?
              </h1>
              <p className="mt-3 text-lg text-muted-foreground">Find local people who can help.</p>
            </div>
            <MapIllustration className="-mt-1 w-28 shrink-0 sm:w-32 md:hidden" />
          </div>

          <form onSubmit={onSubmit} className="mt-8 space-y-3 md:max-w-lg">
            <label className="field">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="sr-only">Service</span>
              <input
                className="field-input py-4"
                placeholder="What service do you need?"
                value={service}
                onChange={(e) => setService(e.target.value)}
                autoComplete="off"
                enterKeyHint="search"
              />
            </label>

            <label className="field">
              <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="sr-only">Area</span>
              <input
                ref={areaRef}
                className="field-input py-4"
                placeholder="Area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                autoComplete="off"
                enterKeyHint="search"
              />
            </label>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
              <button
                type="button"
                onClick={locate}
                className="inline-flex items-center gap-2 rounded-md py-1.5 text-[15px] font-semibold text-primary transition hover:text-primary/80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
              >
                {geo.status === "loading" ? (
                  <Loader2 className="h-[18px] w-[18px] animate-spin" aria-hidden />
                ) : geo.status === "ok" ? (
                  <Check className="h-[18px] w-[18px]" aria-hidden />
                ) : (
                  <LocateFixed className="h-[18px] w-[18px]" aria-hidden />
                )}
                {geo.status === "loading" && "Locating…"}
                {geo.status === "ok" && "Location detected"}
                {(geo.status === "idle" || geo.status === "error") && "Use my current location"}
              </button>
            </div>
            {geo.status === "error" && (
              <p role="alert" className="text-sm text-destructive">
                {geo.message} — type your area instead.
              </p>
            )}

            <button type="submit" disabled={!canSearch} className="btn btn-primary mt-2 w-full text-lg">
              FIND
            </button>
          </form>

          <div className="mt-6 md:max-w-lg">
            <p className="mb-2.5 text-sm font-medium text-muted-foreground">Popular searches</p>
            <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
              {QUICK_PICKS.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => pick(label)}
                  className={`chip shrink-0 bg-card ${
                    service === label ? "border-primary bg-primary/10 text-primary" : "border-input text-foreground/80 hover:border-primary/50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-8 text-sm text-muted-foreground md:max-w-lg">
            Do you offer a service?{" "}
            <Link to="/become-provider" className="font-semibold text-primary underline-offset-4 hover:underline">
              List your service
            </Link>
          </p>
        </section>

        <aside className="hidden md:block" aria-label="Why people use Active">
          <div className="surface relative rounded-[2rem] p-8 lg:p-10">
            <MapIllustration detailed className="mx-auto max-w-sm" />
            <ul className="mt-8 space-y-5">
              {TRUST_POINTS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="font-bold text-foreground">{title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default Index;
