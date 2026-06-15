import './SprayUnderline.css';

function SprayUnderline({ width = 140, color = 'var(--accent)', withDrip = true, className = '' }) {
    const seed = Math.floor(Math.random() * 5) + 3;
    const h = withDrip ? 28 : 14;

    return (
        <svg
            className={`spray-underline ${className}`}
            width={width}
            height={h}
            viewBox={`0 0 ${width} ${h}`}
            aria-hidden="true"
            style={{ display: 'block' }}
        >
            <defs>
                <filter id={`rough-${seed}`}>
                    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise" seed={seed} />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
                </filter>
            </defs>
            <g filter={`url(#rough-${seed})`}>
                <path
                    d={`M4,8 C${width * 0.25},${h * 0.5} ${width * 0.55},${h * 0.15} ${width - 8},${h * 0.45}`}
                    stroke={color}
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    opacity="0.9"
                />
            </g>
            {withDrip && (
                <>
                    <path
                        d={`M${width * 0.35},${h * 0.5} C${width * 0.33},${h * 0.62} ${width * 0.35},${h * 0.7} ${width * 0.37},${h * 0.78}`}
                        stroke={color}
                        strokeWidth="2.2"
                        fill="none"
                        strokeLinecap="round"
                        opacity="0.7"
                    />
                    <circle cx={width * 0.37} cy={h * 0.82} r="1.6" fill={color} opacity="0.8" />
                </>
            )}
        </svg>
    );
}

export default SprayUnderline;
