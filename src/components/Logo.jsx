// The mark: a rounded amber tile with a falling price line ending in a dot:
// "the price, over time". Deliberately simple so it stays crisp at 16px (favicon) and 30px (navbar).
export function LogoMark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="logo-mark">
      <defs>
        <linearGradient id="logo-tile" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f8c979" />
          <stop offset="1" stopColor="#e39a3f" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill="url(#logo-tile)" />
      <path
        d="M7.5 11.5l5.5 5 4.5-3.5 7 7.5"
        fill="none"
        stroke="#16110a"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24.5" cy="20.5" r="2.9" fill="#16110a" />
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
