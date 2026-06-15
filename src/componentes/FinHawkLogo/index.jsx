function FinHawkLogo({ className = '', height = 40 }) {
  return (
    <svg
      className={className}
      height={height}
      viewBox="0 0 340 130"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="FinHawk"
      role="img"
    >
      <text
        x="6"
        y="76"
        fontFamily="Montserrat, Arial, sans-serif"
        fontSize="62"
        fontWeight="800"
        fill="currentColor"
        letterSpacing="-2"
      >
        FH
      </text>

      <path
        d="M6,104 C32,98 62,114 92,100 C104,94 112,92 120,86"
        stroke="#FF3B3B"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />

      <path d="M114,82 L128,87 L118,98 Z" fill="#FF3B3B" />

      <text
        x="6"
        y="124"
        fontFamily="Montserrat, Arial, sans-serif"
        fontSize="22"
        fontWeight="700"
        letterSpacing="6"
        fill="currentColor"
      >
        FINHAWK
      </text>
    </svg>
  );
}

export default FinHawkLogo;
