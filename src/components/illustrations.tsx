export function BananaMark({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden className="shrink-0">
      <path d="M22 96 C18 46 42 22 82 22" stroke="#fbbf24" strokeWidth="17" strokeLinecap="round" fill="none" />
      <path d="M28 90 C30 40 62 13 97 18" stroke="#fde047" strokeWidth="17" strokeLinecap="round" fill="none" />
      <path d="M36 84 C44 36 76 16 106 26" stroke="#facc15" strokeWidth="17" strokeLinecap="round" fill="none" />
      <path d="M32 58 v10" stroke="#365314" strokeWidth="4" strokeLinecap="round" opacity="0.12" />
      <path d="M50 36 q10 4 18 -2" stroke="#854d0e" strokeWidth="4" strokeLinecap="round" opacity="0.35" />
      <rect x="76" y="4" width="9" height="18" rx="3" fill="#84cc16" transform="rotate(18 80 13)" />
      <circle cx="94" cy="16" r="5" fill="#78350f" />
      <circle cx="116" cy="30" r="5" fill="#78350f" />
      <circle cx="92" cy="20" r="5" fill="#78350f" />
      <circle cx="78" cy="30" r="5" fill="#78350f" />
    </svg>
  );
}

export function RiverMark({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden className="shrink-0">
      <path d="M10 42 Q30 24 50 42 T90 42" stroke="#38bdf8" strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M10 66 Q30 48 50 66 T90 66" stroke="#0ea5e9" strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M10 90 Q30 72 50 90 T90 90" stroke="#0284c7" strokeWidth="9" strokeLinecap="round" fill="none" />
      <circle cx="50" cy="26" r="6" fill="#fde047" opacity="0.9" />
    </svg>
  );
}

export function TreeMark({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden className="shrink-0">
      <rect x="52" y="52" width="16" height="38" rx="6" fill="#92400e" />
      <circle cx="52" cy="46" r="26" fill="#16a34a" />
      <circle cx="74" cy="38" r="30" fill="#22c55e" />
      <circle cx="90" cy="52" r="22" fill="#4ade80" />
      <circle cx="34" cy="42" r="6" fill="#fbbf24" />
    </svg>
  );
}

export function FishMark({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden className="shrink-0">
      <path d="M20 60 C40 82 82 80 96 62 L118 44 L96 38 C80 22 44 28 20 60 Z" fill="#22d3ee" />
      <circle cx="52" cy="58" r="6" fill="#155e75" />
      <path d="M62 58 q16 -14 28 -6" stroke="#155e75" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.5" />
      <circle cx="100" cy="86" r="6" fill="#ecfeff" />
    </svg>
  );
}

export function CaveMark({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden className="shrink-0">
      <path d="M8 70 Q30 8 62 8 Q92 8 112 70 L104 106 L96 72 L80 104 L62 74 L46 104 L26 72 L16 106 Z" fill="#16a34a" />
      <path d="M60 8 Q70 26 64 44" stroke="#65a30d" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M36 70 Q60 48 86 70 Q60 58 36 70 Z" fill="#78350f" />
      <circle cx="42" cy="58" r="3" fill="#fff7ed" />
      <circle cx="78" cy="58" r="3" fill="#fff7ed" />
    </svg>
  );
}

export function PalmMark({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden className="shrink-0">
      <path d="M56 110 Q62 70 50 36" stroke="#a16207" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M50 36 Q18 40 8 22" stroke="#4ade80" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M50 36 Q28 58 10 66" stroke="#22c55e" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M50 36 Q84 30 104 14" stroke="#4ade80" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M50 36 Q76 50 102 54" stroke="#22c55e" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M50 36 Q54 14 62 8" stroke="#86efac" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M50 36 Q30 16 22 14" stroke="#86efac" strokeWidth="8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function BasketMark({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden className="shrink-0">
      <path d="M60 20 v14" stroke="#854d0e" strokeWidth="7" strokeLinecap="round" />
      <path d="M38 34 h44 a22 22 0 0 1 -44 0 Z" stroke="#854d0e" strokeWidth="7" fill="none" />
      <path d="M24 42 L36 98 a10 10 0 0 0 10 10 h28 a10 10 0 0 0 10 -10 L96 42 Z" fill="#b45309" />
      <path d="M40 42 q6 24 2 52" stroke="#7c2d12" strokeWidth="5" fill="none" opacity="0.4" strokeLinecap="round" />
      <circle cx="56" cy="66" r="9" fill="#fde047" />
      <circle cx="74" cy="70" r="8" fill="#22c55e" />
      <circle cx="64" cy="84" r="8" fill="#fb923c" />
    </svg>
  );
}

export function BananaTree({ x = 0, y = 0, s = 1 }: { x?: number; y?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 Q6 -60 2 -120" stroke="#65a30d" strokeWidth="14" strokeLinecap="round" fill="none" />
      <path d="M2 -118 Q-20 -150 -46 -142 L-44 -128 Q-20 -134 -4 -110 Z" fill="#84cc16" />
      <path d="M2 -118 Q20 -152 46 -146 L46 -132 Q24 -138 6 -110 Z" fill="#a3e635" />
      <path d="M2 -118 Q-64 -120 -76 -84 L-62 -78 Q-50 -104 -4 -108 Z" fill="#4ade80" />
      <path d="M2 -118 Q66 -118 78 -82 L64 -78 Q52 -104 6 -108 Z" fill="#22c55e" />
      <path d="M2 -118 Q0 -158 10 -166 L16 -152 Q8 -140 8 -110 Z" fill="#86efac" />
      <path d="M60 -150 h10" stroke="#eab308" strokeWidth="5" strokeLinecap="round" />
      <path d="M70 -176 h10" stroke="#fde047" strokeWidth="5" strokeLinecap="round" />
      <path d="M80 -198 h10" stroke="#eab308" strokeWidth="5" strokeLinecap="round" />
    </g>
  );
}

export function ValeScene() {
  return (
    <svg
      viewBox="0 0 560 460"
      className="h-auto w-full"
      role="img"
      aria-label="Paisagem do Vale do Ribeira com rio e bananeiras"
    >
      <defs>
        <linearGradient id="valeSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dbeafe" />
          <stop offset="0.6" stopColor="#e0f2fe" />
          <stop offset="1" stopColor="#f0fdf4" />
        </linearGradient>
        <linearGradient id="valeRiver" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>

      <rect width="560" height="460" fill="url(#valeSky)" />

      <circle cx="470" cy="66" r="34" fill="#fde047" opacity="0.95" />
      <circle cx="470" cy="66" r="50" fill="#fde047" opacity="0.18" />

      <path d="M0 300 C120 240 210 250 300 220 C380 196 440 150 560 130 L560 460 L0 460 Z" fill="#bbf7d0" />
      <path d="M0 330 C140 280 260 292 380 258 C450 238 520 210 560 200 L560 460 L0 460 Z" fill="#86efac" />
      <path d="M0 372 C150 330 300 330 420 292 C480 276 530 268 560 262 L560 460 L0 460 Z" fill="#4ade80" />

      <path d="M70 300 C170 316 268 320 360 300 C430 286 500 270 540 262 L540 430 C420 448 260 440 120 428 Z" fill="#38bdf8" opacity="0.25" />

      <path
        d="M120 430 C200 410 250 424 330 408 C420 392 500 380 560 372 L560 462 L0 462 L0 430 C40 438 70 436 120 430 Z"
        fill="url(#valeRiver)"
      />

      <BananaTree x={70} y={330} s={1.05} />
      <BananaTree x={138} y={342} s={0.8} />
      <BananaTree x={470} y={340} s={1.0} />
      <BananaTree x={525} y={352} s={0.7} />
    </svg>
  );
}