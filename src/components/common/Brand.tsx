import './Brand.css'

export function Brand() {
  return (
    <span className="brand">
      <svg className="brand__mark" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
        <ellipse cx="20" cy="20" rx="17" ry="7" fill="none" stroke="currentColor" strokeWidth="3" transform="rotate(-25 20 20)" />
        <circle cx="20" cy="20" r="6" fill="#fff" />
      </svg>
      <span className="brand__name">ÓRBITA</span>
    </span>
  )
}
