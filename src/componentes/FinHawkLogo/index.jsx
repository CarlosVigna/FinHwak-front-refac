function FinHawkLogo({ className = '', height = 32 }) {
  return (
    <svg
      className={className}
      height={height}
      viewBox="0 0 320 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="FinHawk — Controle. Foco. Liberdade."
      role="img"
    >
      <defs>
        <filter id="fh-logo-rough" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise" seed="7" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
        </filter>
      </defs>

      <text x="11" y="62" fontFamily="Arial, sans-serif" fontSize="46" fontWeight="800" fill="currentColor">
        FH
      </text>
      <g filter="url(#fh-logo-rough)">
        <path
          d="M10,72 C18,80 32,62 46,73 C58,82 70,66 78,75"
          stroke="#e0353c"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          opacity="0.95"
        />
      </g>
      <circle cx="80" cy="78" r="2" fill="#e0353c" opacity="0.9" />

      <text x="100" y="50" fontFamily="Arial, sans-serif" fontSize="34" fontWeight="800" fill="currentColor">
        Fin<tspan fill="#e0353c">Hawk</tspan>
      </text>

      <text x="100" y="74" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="600" letterSpacing="3" fill="currentColor" opacity="0.6">
        CONTROLE. FOCO. LIBERDADE.
      </text>
    </svg>
  );
}

export default FinHawkLogo;
