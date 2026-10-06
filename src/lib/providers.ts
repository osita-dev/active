import { supabase } from "./supabase";

export type Provider = {
  id: string;
  business_name: string;
  description: string | null;
  phone: string;
  whatsapp: string | null;
  photo_url: string | null;
  lat: number | null;
  lng: number | null;
  categories: string[];
  areas: string[];
};

export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export type SearchResult = Provider & {
  distanceKm?: number;
  ratingAvg?: number;
  ratingCount?: number;
};

export async function searchProviders(opts: {
  query: string;
  area?: string;
  userLat?: number;
  userLng?: number;
}): Promise<SearchResult[]> {
  const q = opts.query.trim();

  // 1. Find categories matching the query
  const { data: cats } = await supabase
    .from("categories")
    .select("id, name")
    .or(`name.ilike.%${q}%,slug.ilike.%${q}%`);
  const catIds = (cats ?? []).map((c) => c.id);

  // 2. Provider ids offering those categories
  let idsFromCats: string[] = [];
  if (catIds.length) {
    const { data: ps } = await supabase
      .from("provider_services")
      .select("provider_id")
      .in("category_id", catIds);
    idsFromCats = [...new Set((ps ?? []).map((r) => r.provider_id))];
  }

  // 3. Providers: by category hit OR by name/description text match
  let queryBuilder = supabase
    .from("providers")
    .select("id, business_name, description, phone, whatsapp, photo_url, lat, lng")
    .eq("status", "active");

  if (idsFromCats.length) {
    queryBuilder = queryBuilder.or(
      `id.in.(${idsFromCats.join(",")}),business_name.ilike.%${q}%,description.ilike.%${q}%`,
    );
  } else {
    queryBuilder = queryBuilder.or(`business_name.ilike.%${q}%,description.ilike.%${q}%`);
  }

  const { data: providers, error } = await queryBuilder;
  if (error) throw error;
  if (!providers?.length) return [];

  const ids = providers.map((p) => p.id);

  const [{ data: psAll }, { data: areas }, { data: ratingRows }] = await Promise.all([
    supabase.from("provider_services").select("provider_id, category_id, categories(name)").in("provider_id", ids),
    supabase.from("service_areas").select("provider_id, area_name").in("provider_id", ids),
    supabase.from("ratings").select("provider_id, stars").in("provider_id", ids),
  ]);

  const ratingsByProvider = new Map<string, { sum: number; count: number }>();
  (ratingRows ?? []).forEach((r: any) => {
    const cur = ratingsByProvider.get(r.provider_id) ?? { sum: 0, count: 0 };
    cur.sum += r.stars;
    cur.count += 1;
    ratingsByProvider.set(r.provider_id, cur);
  });

  const catsByProvider = new Map<string, string[]>();
  (psAll ?? []).forEach((r: any) => {
    const arr = catsByProvider.get(r.provider_id) ?? [];
    if (r.categories?.name) arr.push(r.categories.name);
    catsByProvider.set(r.provider_id, arr);
  });
  const areasByProvider = new Map<string, string[]>();
  (areas ?? []).forEach((r: any) => {
    const arr = areasByProvider.get(r.provider_id) ?? [];
    arr.push(r.area_name);
    areasByProvider.set(r.provider_id, arr);
  });

  let results = providers.map((p: any) => {
    const distanceKm =
      opts.userLat != null && opts.userLng != null && p.lat != null && p.lng != null
        ? haversineKm(opts.userLat, opts.userLng, p.lat, p.lng)
        : undefined;
    const rating = ratingsByProvider.get(p.id);
    return {
      ...p,
      categories: catsByProvider.get(p.id) ?? [],
      areas: areasByProvider.get(p.id) ?? [],
      distanceKm,
      ratingAvg: rating ? rating.sum / rating.count : undefined,
      ratingCount: rating?.count ?? 0,
    };
  });

  // Area filter (soft): if user gave an area, rank those providers first but don't hide others.
  if (opts.area?.trim()) {
    const a = opts.area.trim().toLowerCase();
    const inArea = results.filter((r) => r.areas.some((x: string) => x.toLowerCase().includes(a)));
    const outArea = results.filter((r) => !r.areas.some((x: string) => x.toLowerCase().includes(a)));
    results = [...inArea, ...outArea];
  }

  if (opts.userLat != null) {
    results.sort((x, y) => (x.distanceKm ?? 1e9) - (y.distanceKm ?? 1e9) || x.business_name.localeCompare(y.business_name));
  }

  return results;
}

export async function getProviderRating(providerId: string): Promise<{ average: number; count: number }> {
  const { data } = await supabase.from("ratings").select("stars").eq("provider_id", providerId);
  if (!data || data.length === 0) return { average: 0, count: 0 };
  const sum = data.reduce((s: number, r: any) => s + r.stars, 0);
  return { average: sum / data.length, count: data.length };
}

export async function getProvider(id: string): Promise<Provider | null> {
  const { data: p, error } = await supabase
    .from("providers")
    .select("id, business_name, description, phone, whatsapp, photo_url, lat, lng")
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw error;
  if (!p) return null;

  const [{ data: ps }, { data: areas }] = await Promise.all([
    supabase.from("provider_services").select("categories(name)").eq("provider_id", id),
    supabase.from("service_areas").select("area_name").eq("provider_id", id),
  ]);

  return {
    ...(p as any),
    categories: (ps ?? []).map((r: any) => r.categories?.name).filter(Boolean),
    areas: (areas ?? []).map((a: any) => a.area_name),
  };
}
