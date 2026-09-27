// CIPHER mark: an open dial ring around a keyhole, set in an amber tile.
// The store encrypts its prices; this app decodes them. Drawn on a 32-unit grid.
export function LogoMark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="logo-mark">
      <defs>
        <linearGradient id="cipher-tile" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f8c979" />
          <stop offset="1" stopColor="#e39a3f" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill="url(#cipher-tile)" />
      {/* dial ring, open on the right */}
      <path d="M22.5 10.5A8.5 8.5 0 1 0 22.5 21.5" fill="none" stroke="#16110a" strokeWidth="2.8" strokeLinecap="round" />
      {/* keyhole */}
      <circle cx="16" cy="14.4" r="2.5" fill="#16110a" />
      <path d="M14.9 15.5h2.2l0.7 4.6h-3.6z" fill="#16110a" />
    </svg>
  )
}

export default function Logo() {
  return (
    <span className="logo">
      <LogoMark />
      <span className="logo-name">CIPHER</span>
    </span>
  )
}
