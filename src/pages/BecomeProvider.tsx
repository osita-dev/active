import { useEffect, useState } from "react";
import { AlertCircle, Loader2, LogIn, Plus, X, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { normalizeNgPhone } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import FieldBox from "@/components/FieldBox";
import { NigeriaFlag } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { useGeolocation } from "@/hooks/use-geolocation";

type Cat = { id: string; name: string };

const PhonePrefix = () => (
  <span className="flex shrink-0 items-center gap-2 border-r border-border pr-3 text-[15px] font-semibold text-foreground">
    <NigeriaFlag className="h-4 w-6 rounded-[3px] ring-1 ring-black/10" />
    +234
  </span>
);

const BecomeProvider = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [cats, setCats] = useState<Cat[]>([]);
  const [catsLoaded, setCatsLoaded] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [desc, setDesc] = useState("");
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());
  const [areas, setAreas] = useState<string[]>([]);
  const [areaInput, setAreaInput] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { state: geo, request: locate } = useGeolocation();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    supabase
      .from("categories")
      .select("id, name")
      .order("name")
      .then(({ data }) => {
        setCats(data ?? []);
        setCatsLoaded(true);
      });
  }, []);

  const toggleCat = (id: string) => {
    const s = new Set(selectedCats);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setSelectedCats(s);
  };

  const addArea = () => {
    const a = areaInput.trim();
    if (a && !areas.some((x) => x.toLowerCase() === a.toLowerCase())) setAreas([...areas, a]);
    setAreaInput("");
  };

  const submit = async () => {
    if (!userId) return setMsg("Please sign in first.");
    if (!name.trim() || !phone.trim() || selectedCats.size === 0 || areas.length === 0)
      return setMsg("Name, phone, at least one service and one area are required.");

    const phoneE164 = normalizeNgPhone(phone);
    if (!phoneE164) return setMsg("Enter a valid Nigerian phone number, e.g. 812 345 6789.");
    let whatsappE164: string | null = null;
    if (whatsapp.trim()) {
      whatsappE164 = normalizeNgPhone(whatsapp);
      if (!whatsappE164) return setMsg("Enter a valid WhatsApp number, or leave it empty.");
    }

    setSaving(true);
    setMsg(null);

    await supabase.from("profiles").upsert({ id: userId, role: "provider" });

    const { data: provider, error } = await supabase
      .from("providers")
      .insert({
        user_id: userId,
        business_name: name.trim(),
        phone: phoneE164,
        whatsapp: whatsappE164,
        description: desc.trim() || null,
        status: "active",
        lat: geo.status === "ok" ? geo.lat : null,
        lng: geo.status === "ok" ? geo.lng : null,
      })
      .select("id")
      .single();

    if (error || !provider) {
      setSaving(false);
      return setMsg(error?.message ?? "Could not create listing.");
    }

    await supabase.from("provider_services").insert([...selectedCats].map((cid) => ({ provider_id: provider.id, category_id: cid })));
    await supabase.from("service_areas").insert(areas.map((a) => ({ provider_id: provider.id, area_name: a })));

    setSaving(false);
    window.location.href = "/provider/dashboard";
  };

  // Progress nudges people to finish (goal-gradient effect): 4 required things, always visible.
  const steps = [
    { label: "Name", done: name.trim().length > 0 },
    { label: "Phone", done: phone.trim().length > 0 },
    { label: "Services", done: selectedCats.size > 0 },
    { label: "Areas", done: areas.length > 0 },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  const inputCls = "field-input bg-transparent py-1 text-base";

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto w-full max-w-2xl px-5 pb-16 pt-5 md:px-8 md:pt-8">
        <PageHeader title="List your service" />
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">Tell us about your business so customers can find and contact you.</p>

        {userId === null && (
          <div className="alert-warn mt-5 flex items-start gap-3">
            <LogIn className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <p>
              First{" "}
              <Link to="/login?next=/become-provider" className="font-bold underline underline-offset-4">
                sign in
              </Link>
              , then come back here to finish your listing.
            </p>
          </div>
        )}

        <div className="mt-5" aria-label={`${doneCount} of 4 required details complete`}>
          <div className="flex items-center justify-between text-[13px] font-medium text-muted-foreground">
            <span>{doneCount === 4 ? "All set — ready to list" : `${doneCount} of 4 required details`}</span>
            <span className="hidden gap-3 sm:flex">
              {steps.map((s) => (
                <span key={s.label} className={s.done ? "text-primary" : ""}>
                  {s.label}
                </span>
              ))}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(doneCount / 4) * 100}%` }} />
          </div>
        </div>

        <div className="surface mt-5 space-y-4 p-5 sm:p-7">
          <FieldBox label="Business name" htmlFor="bp-name" required>
            <input id="bp-name" className={inputCls} placeholder="e.g. FixRight Electrical" value={name} onChange={(e) => setName(e.target.value)} autoComplete="organization" />
          </FieldBox>

          <FieldBox label="Phone number" htmlFor="bp-phone" required>
            <div className="flex items-center gap-3 pt-0.5">
              <PhonePrefix />
              <input id="bp-phone" className={inputCls} inputMode="tel" autoComplete="tel-national" placeholder="e.g. 812 345 6789" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </FieldBox>

          <FieldBox label="WhatsApp" htmlFor="bp-wa" optional>
            <div className="flex items-center gap-3 pt-0.5">
              <PhonePrefix />
              <input id="bp-wa" className={inputCls} inputMode="tel" placeholder="e.g. 812 345 6789" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
            </div>
          </FieldBox>

          <FieldBox label="Description" htmlFor="bp-desc">
            <textarea id="bp-desc" className={`${inputCls} resize-none`} rows={4} placeholder="Tell customers about your services..." value={desc} onChange={(e) => setDesc(e.target.value)} />
          </FieldBox>

          <fieldset className="pt-2">
            <button type="button" onClick={locate} className="flex items-center gap-2 text-sm font-medium text-primary">
              <MapPin className="h-4 w-4" />
              {geo.status === "loading" && "Getting your location…"}
              {geo.status === "ok" && "✓ Location added — customers will see your real distance"}
              {(geo.status === "idle" || geo.status === "error") && "Add my location so customers see my distance"}
            </button>
            {geo.status === "error" && <p className="mt-1 text-xs text-destructive">{geo.message}</p>}
          </fieldset>

          <fieldset className="space-y-3 pt-2">
            <legend className="text-sm font-bold text-foreground">
              Services <span className="text-primary">*</span> <span className="font-normal text-muted-foreground">(Select multiple)</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {!catsLoaded && [72, 96, 84, 64, 90].map((w) => <Skeleton key={w} style={{ width: w }} className="h-10 rounded-full bg-border/70" />)}
              {catsLoaded && cats.length === 0 && <p className="text-sm text-muted-foreground">No services are available to choose from yet.</p>}
              {cats.map((c) => {
                const on = selectedCats.has(c.id);
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => toggleCat(c.id)}
                    aria-pressed={on}
                    className={`chip ${on ? "border-primary bg-primary text-primary-foreground shadow-cta" : "border-input bg-card text-foreground/80 hover:border-primary/50"}`}
                  >
                    {c.name}
                    {on && <X className="h-3.5 w-3.5" aria-hidden />}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="space-y-3 pt-2">
            <legend className="text-sm font-bold text-foreground">
              Service areas <span className="text-primary">*</span> <span className="font-normal text-muted-foreground">(Add every area you cover)</span>
            </legend>
            <div className="flex flex-wrap items-center gap-2">
              {areas.map((a) => (
                <span key={a} className="chip border-primary bg-primary pr-2.5 text-primary-foreground">
                  {a}
                  <button type="button" onClick={() => setAreas(areas.filter((x) => x !== a))} aria-label={`Remove ${a}`} className="rounded-full p-0.5 transition hover:bg-white/20">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
              <span className="chip gap-1 border-dashed border-primary/50 bg-primary/5 py-0 pl-3.5 pr-1.5 text-primary focus-within:border-primary">
                <input
                  className="w-28 bg-transparent py-2 text-sm font-medium outline-none placeholder:text-primary/70 sm:w-32"
                  placeholder="Add area"
                  aria-label="Add a service area"
                  value={areaInput}
                  onChange={(e) => setAreaInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addArea();
                    }
                  }}
                />
                <button type="button" onClick={addArea} aria-label="Add area" disabled={!areaInput.trim()} className="rounded-full p-1.5 transition hover:bg-primary/10 disabled:opacity-40">
                  <Plus className="h-4 w-4" />
                </button>
              </span>
            </div>
          </fieldset>

          <div className="pt-3">
            <button type="button" onClick={submit} disabled={saving} className="btn btn-primary w-full">
              {saving && <Loader2 className="h-5 w-5 animate-spin" aria-hidden />}
              {saving ? "SAVING…" : "LIST MY SERVICE"}
            </button>
            {msg && (
              <div role="alert" className="alert-error mt-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                {msg}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeProvider;
