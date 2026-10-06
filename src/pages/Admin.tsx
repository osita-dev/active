import { useEffect, useState } from "react";
import { Calendar, Pause, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import ProviderAvatar from "@/components/ProviderAvatar";

type ProviderLite = { business_name: string; photo_url: string | null };

const STATUS_STYLE: Record<string, string> = {
  open: "bg-amber-100 text-amber-800",
  actioned: "bg-primary/10 text-primary",
  dismissed: "bg-muted text-muted-foreground",
};

const Admin = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [providers, setProviders] = useState<Record<string, ProviderLite>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const load = () =>
    supabase
      .from("reports")
      .select("id, reason, status, created_at, reported_provider_id")
      .order("created_at", { ascending: false })
      .then(async ({ data, error }) => {
        if (error) setMsg(error.message);
        else {
          setReports(data ?? []);
          // Names make a report scannable. Best effort: if a provider can't be read, we fall back to a generic title.
          const ids = [...new Set((data ?? []).map((r: any) => r.reported_provider_id).filter(Boolean))];
          if (ids.length) {
            const { data: ps } = await supabase.from("providers").select("id, business_name, photo_url").in("id", ids);
            setProviders(Object.fromEntries((ps ?? []).map((p: any) => [p.id, { business_name: p.business_name, photo_url: p.photo_url }])));
          }
        }
        setLoaded(true);
      });

  useEffect(() => {
    load();
  }, []);

  const suspend = async (reportId: string, providerId: string | null) => {
    if (!providerId) return;
    await supabase.from("providers").update({ status: "suspended" }).eq("id", providerId);
    await supabase.from("reports").update({ status: "actioned" }).eq("id", reportId);
    load();
  };

  const dismiss = async (reportId: string) => {
    await supabase.from("reports").update({ status: "dismissed" }).eq("id", reportId);
    load();
  };

  const pending = reports.filter((r) => r.status === "open").length;

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto w-full max-w-4xl px-5 pb-16 pt-5 md:px-8 md:pt-8">
        <PageHeader
          title="Reports"
          subtitle={loaded && reports.length > 0 ? `${pending} pending` : undefined}
          right={
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold text-foreground/80">
              <ShieldCheck className="h-4 w-4" aria-hidden />
              Admin
            </span>
          }
        />

        {msg && (
          <div role="alert" className="alert-error mt-6">
            {msg}
          </div>
        )}

        {loaded && reports.length === 0 && (
          <div className="surface mt-6 px-6 py-12 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" aria-hidden />
            </span>
            <p className="mt-4 font-bold text-foreground">No reports</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Can't see reports you expect? Set your profile role to 'admin' in SQL.
            </p>
          </div>
        )}

        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {reports.map((r) => {
            const prov = r.reported_provider_id ? providers[r.reported_provider_id] : undefined;
            return (
              <li key={r.id} className="surface flex flex-col gap-4 p-5">
                <div className="flex items-start gap-3.5">
                  <ProviderAvatar name={prov?.business_name ?? "?"} src={prov?.photo_url} size={52} rounded="xl" />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-bold text-foreground">{prov?.business_name ?? "Provider report"}</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">Reason: {r.reason}</p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" aria-hidden />
                      {new Date(r.created_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLE[r.status] ?? STATUS_STYLE.dismissed}`}>
                    {r.status === "open" ? "Pending" : r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </span>
                </div>

                {r.status === "open" && (
                  <div className="mt-auto flex gap-2.5">
                    <button onClick={() => suspend(r.id, r.reported_provider_id)} className="btn btn-danger-soft min-h-[46px] flex-1 px-3 text-sm">
                      <Pause className="h-4 w-4" aria-hidden />
                      Suspend provider
                    </button>
                    <button onClick={() => dismiss(r.id)} className="btn btn-neutral min-h-[46px] flex-1 px-3 text-sm font-semibold">
                      Dismiss
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Admin;
