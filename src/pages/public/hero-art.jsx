// Abstract hero illustration — glowing interconnected shapes & data streams
// for the public landing page.
export default (
  <svg className="art-svg" viewBox="0 0 560 520" width="560" height="520" role="img" aria-label="Abstract illustration of glowing interconnected shapes and data streams">
    <defs>
      <linearGradient id="gBlue" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#2f6bff" />
        <stop offset="100%" stopColor="#7c5cff" />
      </linearGradient>
      <linearGradient id="gMag" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#d63aff" />
        <stop offset="100%" stopColor="#7c5cff" />
      </linearGradient>
      <radialGradient id="glowA" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#2f6bff" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#2f6bff" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="glowB" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#d63aff" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#d63aff" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* ambient glows */}
    <circle cx="150" cy="180" r="180" fill="url(#glowA)" />
    <circle cx="420" cy="330" r="180" fill="url(#glowB)" />

    {/* data streams */}
    <g stroke="#2f6bff" strokeOpacity="0.5" fill="none">
      <path d="M120 420 C 200 360, 260 470, 340 380" strokeWidth="2" strokeDasharray="4 8" />
      <path d="M60 220 C 160 280, 200 160, 300 260" strokeWidth="1.5" strokeDasharray="2 6" />
      <path d="M360 120 C 420 200, 480 180, 500 260" strokeWidth="1.5" strokeDasharray="3 7" />
    </g>

    {/* centre node: hex prism */}
    <polygon points="280,90 380,146 380,258 280,314 180,258 180,146" fill="url(#gBlue)" stroke="#9fb6ff" strokeWidth="2" opacity="0.95" />
    <polygon points="280,90 380,146 380,258 280,314 180,258 180,146" fill="none" stroke="#cfe0ff" strokeWidth="1" transform="translate(0,-26) scale(1)" opacity="0.4" />
    <circle cx="280" cy="202" r="46" fill="#0d0e14" stroke="#d63aff" strokeWidth="3" />
    <circle cx="280" cy="202" r="20" fill="#d63aff" />

    {/* orbiting shapes */}
    <circle cx="120" cy="150" r="30" fill="#0d0e14" stroke="url(#gMag)" strokeWidth="3" />
    <circle cx="120" cy="150" r="9" fill="#d63aff" />
    <rect x="368" y="300" width="40" height="40" rx="8" fill="#0d0e14" stroke="url(#gBlue)" strokeWidth="3" transform="rotate(20 388 320)" />
    <rect x="368" y="300" width="16" height="16" rx="4" fill="#2f6bff" transform="rotate(20 388 320)" />
    <circle cx="470" cy="170" r="22" fill="#0d0e14" stroke="#7c5cff" strokeWidth="3" />
    <circle cx="470" cy="170" r="9" fill="#7c5cff" />

    {/* connection dots */}
    <g fill="#6fd3ff">
      <circle cx="120" cy="150" r="4" /><circle cx="280" cy="202" r="5" />
      <circle cx="388" cy="320" r="4" /><circle cx="470" cy="170" r="4" />
    </g>

    {/* stream nodes */}
    <g fill="#ffffff" fillOpacity="0.9">
      <circle cx="200" cy="430" r="4"><animate attributeName="opacity" values="0.2;1;0.2" dur="2.4s" repeatCount="indefinite" /></circle>
      <circle cx="300" cy="390" r="3"><animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite" /></circle>
    </g>
  </svg>
)
