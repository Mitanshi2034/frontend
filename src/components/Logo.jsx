// The mark: a price tag whose string-hole runs out into a falling price line.
// Drawn by hand on a 32-unit grid; the cut-outs use the page colour so it reads as one solid shape.
export function LogoMark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="logo-mark">
      <defs>
        <linearGradient id="tag-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7cd86" />
          <stop offset="1" stopColor="#dc8f35" />
        </linearGradient>
      </defs>
      <path
        d="M13.2 4.5h12.3a2.5 2.5 0 0 1 2.5 2.5v18a2.5 2.5 0 0 1-2.5 2.5H13.2a2.5 2.5 0 0 1-1.9-.9L4.6 17.6a2.5 2.5 0 0 1 0-3.2l6.7-9a2.5 2.5 0 0 1 1.9-.9z"
        fill="url(#tag-fill)"
      />
      <circle cx="11.4" cy="16" r="2.1" fill="var(--bg)" />
      <path
        d="M14.6 16h2.6l2.4 4.3 2.7-5.6 3.1 6.6"
        fill="none"
        stroke="var(--bg)"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Logo() {
  return (
    <span className="logo">
      <LogoMark />
      <span className="logo-text">
        <span className="logo-name">
          price<span className="logo-name-2">trail</span>
        </span>
        <span className="logo-sub">INE store tracker</span>
      </span>
    </span>
  )
}
