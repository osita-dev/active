import { useState } from "react";

export type GeoState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; lat: number; lng: number }
  | { status: "error"; message: string };

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({ status: "idle" });

  const request = () => {
    if (!("geolocation" in navigator)) {
      setState({ status: "error", message: "Geolocation not supported on this device." });
      return;
    }
    setState({ status: "loading" });
    navigator.geolocation.getCurrentPosition(
      (pos) => setState({ status: "ok", lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setState({ status: "error", message: err.message }),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return { state, request };
}
