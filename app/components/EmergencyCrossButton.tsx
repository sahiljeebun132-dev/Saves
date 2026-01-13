'use client'

import { useEffect, useState } from 'react'

type Size = 'lg' | 'sm'

type Ripple = {
  key: number
}

export default function EmergencyCrossButton({
  onClick,
  loading = false,
  disabled,
  size = 'lg',
  ariaLabel = 'Call a Doctor',
  attention = true,
}: {
  onClick: () => void
  loading?: boolean
  disabled?: boolean
  size?: Size
  ariaLabel?: string
  attention?: boolean
}) {
  const [ripple, setRipple] = useState<Ripple | null>(null)

  useEffect(() => {
    if (!ripple) return
    const t = window.setTimeout(() => setRipple(null), 650)
    return () => window.clearTimeout(t)
  }, [ripple])

  const baseSizeClasses =
    size === 'lg' ? 'h-24 w-24 text-5xl' : 'h-10 w-10 text-xl'

  const isDisabled = disabled ?? loading

  return (
    <div className="relative inline-flex">
      {attention && !isDisabled && (
        <>
          <span className="pointer-events-none absolute -inset-4 rounded-full bg-red-500/15 animate-pulse" />
          <span className="pointer-events-none absolute -inset-8 rounded-full border-2 border-red-500/25 animate-ping" />
        </>
      )}

      <button
        type="button"
        onClick={onClick}
        onPointerDown={() => {
          setRipple({ key: Date.now() })
        }}
        disabled={isDisabled}
        aria-label={ariaLabel}
        className={[
          'relative inline-flex items-center justify-center rounded-full',
          'bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed',
          'text-white font-extrabold shadow-xl transition duration-200',
          'focus:outline-none focus:ring-4 focus:ring-red-300',
          'overflow-hidden select-none',
          baseSizeClasses,
        ].join(' ')}
      >
        {ripple && (
          <span
            key={ripple.key}
            className="pointer-events-none absolute inset-0 rounded-full bg-white/35 animate-ping"
          />
        )}

        <span className={['relative leading-none', loading ? 'animate-pulse' : ''].join(' ')}>
          ✚
        </span>

        <span className="sr-only">{loading ? 'Calling Doctor…' : ariaLabel}</span>
      </button>
    </div>
  )
}
