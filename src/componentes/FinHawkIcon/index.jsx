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
      <text
        x="14"
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
        d="M14,104 C40,98 70,114 100,100 C112,94 120,92 128,86"
        stroke="#FF3B3B"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />

      <path d="M122,82 L136,87 L126,98 Z" fill="#FF3B3B" />
    </svg>
  );
}

export default FinHawkIcon;
