import { cn } from "@/lib/utils";

/**
 * Pin-on-a-map illustration. `detailed` adds the skyline, trees and clouds
 * used on empty states; the compact version sits beside the home headline.
 */
const MapIllustration = ({ detailed = false, className }: { detailed?: boolean; className?: string }) => (
  <svg
    viewBox="0 0 260 200"
    role="img"
    aria-label="Map with a location pin"
    className={cn("h-auto w-full", className)}
    fill="none"
  >
    {!detailed && <ellipse cx="130" cy="112" rx="112" ry="76" fill="#DDF3E8" opacity="0.85" />}
    {detailed && (
      <>
        {/* clouds */}
        <g fill="#E3EDF6">
          <ellipse cx="52" cy="46" rx="26" ry="10" />
          <ellipse cx="66" cy="40" rx="16" ry="11" />
          <ellipse cx="214" cy="42" rx="20" ry="8" />
          <ellipse cx="224" cy="37" rx="11" ry="8" />
        </g>
        {/* skyline */}
        <rect x="52" y="84" width="30" height="46" rx="3" fill="#DCE8F1" />
        <rect x="170" y="72" width="34" height="60" rx="3" fill="#DCE8F1" />
        <g fill="#C6D8E6">
          <rect x="58" y="92" width="6" height="6" rx="1" />
          <rect x="70" y="92" width="6" height="6" rx="1" />
          <rect x="58" y="104" width="6" height="6" rx="1" />
          <rect x="70" y="104" width="6" height="6" rx="1" />
          <rect x="177" y="82" width="6" height="6" rx="1" />
          <rect x="190" y="82" width="6" height="6" rx="1" />
          <rect x="177" y="96" width="6" height="6" rx="1" />
          <rect x="190" y="96" width="6" height="6" rx="1" />
        </g>
        {/* trees */}
        <g>
          <rect x="33" y="126" width="3" height="26" rx="1.5" fill="#4C9C6E" />
          <ellipse cx="34.5" cy="116" rx="13" ry="18" fill="#A9DDBE" />
          <rect x="226" y="124" width="3" height="28" rx="1.5" fill="#4C9C6E" />
          <ellipse cx="227.5" cy="113" rx="13" ry="19" fill="#A9DDBE" />
        </g>
      </>
    )}

    {/* map plane */}
    <path d="M48 138 L112 108 L178 118 L232 94 L214 158 L140 182 L66 168 Z" fill="#E8F1F8" stroke="#D4E3EF" strokeWidth="1.5" strokeLinejoin="round" />
    <g stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" fill="none">
      <path d="M70 150 L134 128 L204 146" />
      <path d="M112 114 L146 176" />
      <path d="M168 122 L190 164" />
    </g>
    {!detailed && <path d="M132 176 C 160 150, 196 140, 232 126" stroke="#0E9A5B" strokeWidth="3.5" strokeLinecap="round" />}

    {/* pin */}
    <g className="pin-drop" style={{ transformOrigin: "130px 120px" }}>
      <ellipse cx="130" cy="130" rx="16" ry="5" fill="#0E9A5B" opacity="0.18" />
      <path
        d="M130 34c-21 0-38 16.6-38 37.2 0 27 38 64.8 38 64.8s38-37.8 38-64.8C168 50.6 151 34 130 34z"
        fill="#0E9A5B"
      />
      <circle cx="130" cy="70" r="13" fill="#FFFFFF" />
    </g>

    {/* sparks */}
    <g stroke="#0E9A5B" strokeWidth="4" strokeLinecap="round">
      <path d="M130 12 V 20" />
      <path d="M104 20 L109 27" />
      <path d="M156 20 L151 27" />
    </g>
  </svg>
);

export default MapIllustration;
