import type { ReactNode } from 'react'

const PATHS: Record<string, ReactNode> = {
  drop: (
    <path d="M12 3c4.5 5.6 7.5 9.5 7.5 13a7.5 7.5 0 1 1-15 0C4.5 12.5 7.5 8.6 12 3z" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3.5 7.5 12 13l8.5-5.5" />
    </>
  ),
  pulse: <path d="M3 12h4l2.5-7 5 14 2.5-7H21" />,
  tag: (
    <>
      <path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
      <circle cx="7.5" cy="7.5" r="1" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 7h3.4M12.6 7H20M4 17h8.4M17.6 17H20" />
      <circle cx="10" cy="7" r="2.4" />
      <circle cx="15" cy="17" r="2.4" />
    </>
  ),
  bolt: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </>
  ),
  up_right: <path d="M7 17 17 7M8 7h9v9" />,
  check: <path d="M5 13l4 4L19 7" />,
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </>
  ),
  shield: <path d="M12 3l7 3v5.5c0 4.4-2.9 7.9-7 9.5-4.1-1.6-7-5.1-7-9.5V6z" />,
  play: <path d="M8 5.5v13l11-6.5z" />,
  refresh: (
    <>
      <path d="M20 12a8 8 0 1 1-2.3-5.6" />
      <path d="M20 3v4h-4" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="18" r="2.4" />
      <circle cx="18" cy="6" r="2.4" />
      <path d="M8.4 18H15a3 3 0 0 0 3-3v-1.5M6 15.5V9a3 3 0 0 1 3-3h2.5" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M10 11v6M14 11v6" />
      <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z" />
      <path d="M13.5 6.5l3 3" />
    </>
  ),
  minus: <path d="M5 12h14" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  spark: (
    <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z" />
  ),
  phone: (
    <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L19 18l-2 3a16 16 0 0 1-12-12z" />
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.6 2.6 2.6 15.4 0 18M12 3c-2.6 2.6-2.6 15.4 0 18" />
    </>
  ),
  building: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1.5" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h6v6" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3l9 5-9 5-9-5z" />
      <path d="M3 13l9 5 9-5" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v10M8 11l4 4 4-4" />
      <path d="M5 19h14" />
    </>
  ),
}

export function Ic({
  name,
  size = 16,
  sw = 1.25,
  className = '',
}: {
  name: keyof typeof PATHS | string
  size?: number
  sw?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="eyebrow">{children}</span>
}

export function SectionHead({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string
  title: ReactNode
  desc?: ReactNode
}) {
  return (
    <div className="fade-up mb-10 md:mb-14">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="mt-6 font-display text-[2.6rem] leading-[1.04] font-light tracking-[-0.01em] text-ink md:text-[3.7rem]">
        {title}
      </h1>
      {desc && (
        <p className="mt-5 max-w-2xl text-[15px] font-light leading-relaxed text-ink-soft">{desc}</p>
      )}
    </div>
  )
}

const STATUS_STYLES = {
  created: 'bg-teal-700/[0.07] text-teal-900 ring-teal-800/20',
  skipped: 'bg-ink/[0.04] text-ink-mute ring-ink/15',
  duplicate: 'bg-amber-500/10 text-amber-900 ring-amber-700/25',
} as const

export function StatusPill({
  kind,
  children,
}: {
  kind: keyof typeof STATUS_STYLES
  children: ReactNode
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ring-1 ${STATUS_STYLES[kind]}`}
    >
      {children}
    </span>
  )
}

// «Двойная фаска»: внешняя оболочка + внутреннее ядро с концентричными радиусами.
export function Shell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`shell ${className}`}>
      <div className="shell-core h-full">{children}</div>
    </div>
  )
}

export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-full ring-1 transition-colors duration-500 ease-swift ${
        on ? 'bg-teal-700/15 ring-teal-700/30' : 'bg-ink/[0.05] ring-ink/10'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full transition-transform duration-500 ease-swift ${
          on ? 'translate-x-5 bg-teal-700' : 'translate-x-0 bg-ink-faint'
        }`}
      />
    </button>
  )
}

export const ACCENT_DOT: Record<string, string> = {
  teal: 'bg-teal-600',
  cyan: 'bg-cyan-600',
  violet: 'bg-violet-500',
  amber: 'bg-amber-500',
}
