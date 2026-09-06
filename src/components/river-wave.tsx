export default function RiverWave({
  className = "",
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <div aria-hidden className={`pointer-events-none w-full ${flip ? "-scale-y-100" : ""} ${className}`}>
      <svg
        className="block h-14 w-full md:h-24"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        fill="currentColor"
      >
        <path
          d="M0,64 C240,112 480,8 720,40 C960,72 1200,120 1440,64 L1440,120 L0,120 Z"
          opacity="0.4"
        />
        <path d="M0,92 C300,120 600,52 900,74 C1140,92 1320,116 1440,102 L1440,120 L0,120 Z" />
      </svg>
    </div>
  );
}