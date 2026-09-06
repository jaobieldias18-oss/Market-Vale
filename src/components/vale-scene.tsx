export function ValeToWorldScene() {
  return (
    <svg
      viewBox="0 0 640 520"
      className="h-auto w-full"
      role="img"
      aria-label="Vista do Vale do Ribeira com rio, ponte e cidade, do Vale para o mundo"
    >
      <defs>
        <linearGradient id="vwSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0ea5e9" />
          <stop offset="0.55" stopColor="#bae6fd" />
          <stop offset="1" stopColor="#fef9c3" />
        </linearGradient>
        <linearGradient id="vwSkyGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7dd3fc" stopOpacity="0.5" />
          <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="vwRiver" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id="vwRiverLight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7dd3fc" stopOpacity="0.8" />
          <stop offset="1" stopColor="#e0f2fe" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="640" height="520" fill="url(#vwSky)" />

      <ellipse cx="320" cy="210" rx="150" ry="120" fill="url(#vwSkyGlow)" />

      <circle cx="520" cy="70" r="34" fill="#fef08a" />
      <circle cx="520" cy="70" r="46" fill="#fde047" opacity="0.25" />

      <circle cx="150" cy="70" r="4" fill="#fff" opacity="0.8" />
      <circle cx="210" cy="40" r="3" fill="#fff" opacity="0.7" />
      <circle cx="300" cy="84" r="3" fill="#fff" opacity="0.8" />
      <circle cx="460" cy="44" r="3" fill="#fff" opacity="0.7" />
      <circle cx="572" cy="120" r="3" fill="#fff" opacity="0.7" />

      <g fill="#65a30d">
        <circle cx="60" cy="150" r="54" />
        <circle cx="90" cy="150" r="54" />
        <circle cx="24" cy="180" r="54" />
        <circle cx="600" cy="150" r="50" />
        <circle cx="620" cy="170" r="50" />
      </g>
      <g fill="#4d7c0f">
        <circle cx="60" cy="150" r="22" />
        <circle cx="600" cy="150" r="20" />
      </g>

      <rect x="120" y="250" width="70" height="70" rx="6" fill="#e2e8f0" />
      <rect x="206" y="240" width="80" height="80" rx="6" fill="#cbd5e1" />
      <rect x="560" y="240" width="70" height="80" rx="6" fill="#cbd5e1" />
      <rect x="500" y="250" width="54" height="70" rx="6" fill="#e2e8f0" />
      <path d="M150 320 L150 250 L162 238 L174 250 L174 320 Z" fill="#94a3b8" />
      <path d="M236 320 L236 240 L250 226 L264 240 L264 320 Z" fill="#94a3b8" />
      <path d="M586 320 L586 240 L599 226 L612 240 L612 320 Z" fill="#b0bcc9" />
      <path d="M166 250 L166 238" stroke="#f59e0b" strokeWidth="3" />
      <path d="M236 240 L250 226" stroke="#f59e0b" strokeWidth="3" />
      <path d="M586 240 L599 226" stroke="#f59e0b" strokeWidth="3" />
      <rect x="132" y="262" width="10" height="10" fill="#fde047" />
      <rect x="150" y="262" width="10" height="10" fill="#fde047" />
      <rect x="132" y="282" width="10" height="10" fill="#f8fafc" />
      <rect x="216" y="252" width="12" height="12" fill="#fde047" />
      <rect x="238" y="252" width="12" height="12" fill="#fde047" />
      <rect x="216" y="276" width="12" height="12" fill="#f8fafc" />
      <rect x="510" y="262" width="10" height="10" fill="#fde047" />
      <rect x="528" y="262" width="10" height="10" fill="#fde047" />
      <rect x="570" y="254" width="12" height="12" fill="#fde047" />
      <rect x="590" y="254" width="12" height="12" fill="#fde047" />

      <rect x="150" y="320" width="400" height="16" rx="8" fill="#475569" />
      <path d="M150 328 v180" stroke="#475569" strokeWidth="6" />
      <path d="M550 328 v180" stroke="#475569" strokeWidth="6" />
      <path d="M150 322 h20 v-10 h16 v10 h20" fill="#94a3b8" />
      <path d="M530 332 h20 v-10 h16 v10 h20" fill="#94a3b8" />

      <rect x="40" y="352" width="560" height="64" rx="30" fill="#ffffff" opacity="0.55" />
      <rect x="40" y="392" width="560" height="24" rx="12" fill="#e2e8f0" opacity="0.6" />

      <g fill="#f43f5e" transform={`translate(290 380) rotate(6 0 0)`}>
        <path d="M0 -18 a14 14 0 0 1 9 2 q-2 -6 4 -12 q6 6 0 12 a14 14 0 0 1 -13 0 Z" />
        <circle cx="-8" cy="-4" r="1.5" opacity="0.25" />
      </g>
      <circle cx="342" cy="400" r="10" fill="#22c55e" />
      <circle cx="368" cy="398" r="16" fill="#16a34a" />
      <circle cx="392" cy="404" r="12" fill="#4ade80" />

      <path d="M0 420 C130 380 300 430 420 404 C520 384 600 366 640 372 L640 520 L0 520 Z" fill="#16a34a" />
      <path d="M0 448 C140 412 320 458 440 436 C540 418 600 400 640 406 L640 520 L0 520 Z" fill="#15803d" />
      <path d="M0 480 C160 448 340 488 470 466 C560 452 620 444 640 448 L640 520 L0 520 Z" fill="#166534" />

      <path d="M60 360 h52" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
      <path d="M66 360 q26 -26 8 -44" fill="#4ade80" />
      <path d="M92 360 q18 -26 44 -18" fill="#22c55e" />
      <path d="M60 360 q-6 -24 -24 -22" fill="#84cc16" />
      <path d="M60 360 l0 8" stroke="#854d0e" strokeWidth="4" strokeLinecap="round" />
      <path d="M88 360 l0 10" stroke="#854d0e" strokeWidth="4" strokeLinecap="round" />

      <path
        d="M0 470 C140 440 300 480 430 458 C540 442 620 428 640 432 L640 520 L0 520 Z"
        fill="url(#vwRiver)"
      />

      <path d="M60 490 q60 -8 120 0 t120 0 t120 0 t120 0" stroke="#e0f2fe" strokeWidth="4" fill="none" opacity="0.5" strokeLinecap="round" />
      <path d="M80 506 q70 -8 140 0 t140 0 t140 0" stroke="#bae6fd" strokeWidth="4" fill="none" opacity="0.4" strokeLinecap="round" />
    </svg>
  );
}