import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, LogOut, MapPin, MessageCircle, Phone, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatWhen } from "@/lib/format";
import Logo from "@/components/Logo";
import ProviderAvatar from "@/components/ProviderAvatar";
import MapIllustration from "@/components/Illustrations";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [provider, setProvider] = useState<any>(null);
  const [inbox, setInbox] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setLoading(false);
        return;
      }
      setSignedIn(true);
      const { data: p } = await supabase
        .from("providers")
        .select("*, provider_services(categories(name)), service_areas(area_name)")
        .eq("user_id", data.user.id)
        .maybeSingle();
      setProvider(p);

      if (p) {
        const { data: convos } = await supabase
          .from("conversations")
          .select("id, created_at, messages(body, created_at, sender_id)")
          .eq("provider_id", p.id)
          .order("created_at", { ascending: false });

        setInbox(
          (convos ?? []).map((c: any) => {
            const msgs = [...(c.messages ?? [])].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
            const last = msgs[0];
            return { id: c.id, last, unread: last && last.sender_id !== data.user!.id };
          }),
        );
      }
      setLoading(false);
    });
  }, []);

  if (loading)
    return (
      <div className="min-h-dvh bg-background">
        <div className="mx-auto w-full max-w-3xl space-y-5 px-5 pt-6 md:px-8" aria-busy="true" aria-label="Loading dashboard">
          <Skeleton className="h-8 w-32 bg-border/70" />
          <Skeleton className="h-64 w-full rounded-3xl bg-border/70" />
          <Skeleton className="h-48 w-full rounded-3xl bg-border/70" />
        </div>
      </div>
    );

  if (!provider)
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 pb-16 text-center">
        <MapIllustration detailed className="max-w-xs" />
        <h1 className="mt-4 text-balance text-2xl font-extrabold text-foreground">
          {signedIn ? "You don't have a listing yet" : "Sign in to see your dashboard"}
        </h1>
        <p className="mt-2 max-w-sm text-muted-foreground">
          {signedIn ? "Create a listing and customers nearby can start messaging you." : "Your listing and customer messages are waiting for you."}
        </p>
        <Link to={signedIn ? "/become-provider" : "/login?next=/provider/dashboard"} className="btn btn-primary mt-7 w-full max-w-xs">
          {signedIn ? "CREATE YOUR LISTING" : "SIGN IN"}
        </Link>
      </div>
    );

  const services: string[] = (provider.provider_services ?? []).map((s: any) => s.categories?.name).filter(Boolean);
  const serviceAreas: string[] = (provider.service_areas ?? []).map((a: any) => a.area_name);
  const isActive = provider.status === "active";
  const unreadCount = inbox.filter((c) => c.unread).length;

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto w-full max-w-3xl px-5 pb-16 pt-5 md:px-8 md:pt-8">
        <header className="flex items-center justify-between">
          <Logo variant="pin" />
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground"
          >
            <LogOut className="h-[18px] w-[18px]" aria-hidden />
            Sign out
          </button>
        </header>

        <section className="surface mt-6 space-y-6 p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <ProviderAvatar name={provider.business_name} src={provider.photo_url} size={72} />
            <div className="min-w-0 flex-1">
              <h1 className="text-balance text-xl font-extrabold leading-tight text-foreground">{provider.business_name}</h1>
              {services.length > 0 && <p className="mt-0.5 text-sm text-muted-foreground">{services.slice(0, 2).join(" · ")}</p>}
              {serviceAreas.length > 0 && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{serviceAreas[0]}</span>
                </p>
              )}
            </div>
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                isActive ? "bg-primary text-primary-foreground" : "bg-amber-100 text-amber-800"
              }`}
            >
              {isActive ? "Active" : provider.status}
            </span>
          </div>

          {services.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-foreground">Services</h2>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {services.map((s, i) => (
                  <span key={`${s}-${i}`} className="chip-tag">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {serviceAreas.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-foreground">Service areas</h2>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {serviceAreas.map((a, i) => (
                  <span key={`${a}-${i}`} className="chip-tag">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/50 px-4 py-3.5 text-[15px] font-medium text-foreground/80">
            <Phone className="h-[18px] w-[18px] shrink-0 text-primary" aria-hidden />
            {provider.phone}
          </div>
        </section>

        <section className="mt-8" aria-labelledby="messages-heading">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 id="messages-heading" className="text-lg font-extrabold text-foreground">
              Messages
            </h2>
            {unreadCount > 0 && <span className="text-sm font-semibold text-primary">{unreadCount} new</span>}
          </div>

          {inbox.length === 0 ? (
            <div className="surface flex flex-col items-center px-6 py-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MessageCircle className="h-6 w-6" aria-hidden />
              </span>
              <p className="mt-4 font-bold text-foreground">No conversations yet</p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">When a customer messages you, it will show up here.</p>
            </div>
          ) : (
            <ul className="surface divide-y divide-border overflow-hidden">
              {inbox.map((c) => (
                <li key={c.id}>
                  <Link to={`/chat/${c.id}`} className="flex items-center gap-3.5 px-4 py-4 transition hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none sm:px-5">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className={`truncate text-[15px] text-foreground ${c.unread ? "font-extrabold" : "font-bold"}`}>Customer</p>
                        <span className="shrink-0 text-xs text-muted-foreground">{formatWhen(c.last?.created_at)}</span>
                      </div>
                      <div className="mt-0.5 flex items-center justify-between gap-3">
                        <p className={`truncate text-sm ${c.unread ? "font-medium text-foreground/80" : "text-muted-foreground"}`}>
                          {c.last ? c.last.body : "Conversation started"}
                        </p>
                        {c.unread && <span className="shrink-0 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground">New</span>}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground/60" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
