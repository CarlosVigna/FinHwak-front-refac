function FinHawkIcon({ className = '', size = 26 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 140 140"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="FinHawk"
      role="img"
    >
      <defs>
        <filter id="fh-icon-rough" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise" seed="7" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
        </filter>
      </defs>

      <text x="20" y="78" fontFamily="Arial, sans-serif" fontSize="64" fontWeight="800" fill="currentColor">
        FH
      </text>

      <g filter="url(#fh-icon-rough)">
        <path
          d="M18,100 C28,112 48,82 70,102 C88,118 108,90 128,108"
          stroke="#e0353c"
          strokeWidth="5.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.95"
        />
      </g>

      <path d="M70,102 C69,109 68,116 71,121" stroke="#e0353c" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
      <circle cx="134" cy="111" r="2.5" fill="#e0353c" opacity="0.9" />
      <circle cx="139" cy="117" r="1.4" fill="#e0353c" opacity="0.6" />
    </svg>
  );
}

export default FinHawkIcon;
