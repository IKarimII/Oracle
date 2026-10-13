import { useEffect, useState } from 'react'

const prefersCalm = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Types `text` out. Remount with a new `key` to restart. */
export function Typewriter({ text, className }: { text: string; className?: string }) {
  const [shown, setShown] = useState(() => (prefersCalm() ? text.length : 0))

  useEffect(() => {
    const id = setInterval(() => {
      setShown((n) => {
        if (n >= text.length) clearInterval(id)
        return Math.min(text.length, n + 1)
      })
    }, 18)
    return () => clearInterval(id)
  }, [text])

  // The untyped remainder is rendered invisibly so the panel doesn't grow as it types.
  return (
    <p className={className} aria-label={text}>
      <span aria-hidden>{text.slice(0, shown)}</span>
      <span aria-hidden className="invisible">
        {text.slice(shown)}
      </span>
    </p>
  )
}
