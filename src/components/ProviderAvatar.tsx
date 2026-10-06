import { useState } from "react";
import { cn } from "@/lib/utils";

// Brand-safe tiles so a list of providers feels varied but never noisy.
const TILES = [
  "bg-[#12263F] text-white",
  "bg-primary text-primary-foreground",
  "bg-[#1D4ED8] text-white",
  "bg-[#E6F5EC] text-primary",
  "bg-[#EEF2F8] text-[#12263F]",
];

const tileFor = (name: string) => TILES[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % TILES.length];

type Props = {
  name: string;
  src?: string | null;
  /** pixel size of the square */
  size?: number;
  className?: string;
  rounded?: "xl" | "2xl" | "full";
};

const ProviderAvatar = ({ name, src, size = 80, className, rounded = "2xl" }: Props) => {
  const [broken, setBroken] = useState(false);
  const radius = rounded === "full" ? "rounded-full" : rounded === "xl" ? "rounded-xl" : "rounded-2xl";
  const style = { width: size, height: size };

  if (src && !broken) {
    return (
      <img
        src={src}
        alt=""
        loading="lazy"
        onError={() => setBroken(true)}
        style={style}
        className={cn("shrink-0 object-cover ring-1 ring-black/5", radius, className)}
      />
    );
  }

  return (
    <div
      aria-hidden
      style={{ ...style, fontSize: size * 0.4 }}
      className={cn("flex shrink-0 items-center justify-center font-extrabold ring-1 ring-black/5", radius, tileFor(name), className)}
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </div>
  );
};

export default ProviderAvatar;
