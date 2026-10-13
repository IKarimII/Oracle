/** What the orb remembers about this browser between games. */
export interface Memory {
  /** Games played through to the reveal */
  completed: number
  /** A game was started and never finished (left, reloaded, or restarted) */
  inProgress: boolean
  /** ISO timestamp of the last time a game was started */
  lastSeen: string | null
  /** Most recent answer given to each question, by question id */
  answers: Record<string, string>
  /** The place named at the last reveal, to notice if the visitor has since moved */
  lastPlace: string | null
}

const KEY = 'oracle.memory'
export const EMPTY: Memory = { completed: 0, inProgress: false, lastSeen: null, answers: {}, lastPlace: null }

export function clearMemory(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // Nothing stored, nothing to clear.
  }
}

export function loadMemory(): Memory {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    if (!raw || typeof raw !== 'object') return EMPTY
    const m = raw as Partial<Memory>
    return {
      completed: typeof m.completed === 'number' ? m.completed : 0,
      inProgress: m.inProgress === true,
      lastSeen: typeof m.lastSeen === 'string' ? m.lastSeen : null,
      answers: m.answers && typeof m.answers === 'object' ? m.answers : {},
      lastPlace: typeof m.lastPlace === 'string' ? m.lastPlace : null,
    }
  } catch {
    return EMPTY
  }
}

export function saveMemory(memory: Memory): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(memory))
  } catch {
    // Storage blocked: the orb simply won't recognise this visitor next time.
  }
}

const DAY_MS = 86_400_000
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

/** "earlier today", "yesterday", "3 days ago", "on 12 October" */
export function whenPhrase(iso: string | null, now = new Date()): string {
  const then = iso ? new Date(iso) : null
  if (!then || Number.isNaN(then.getTime())) return 'before'
  const days = Math.round((startOfDay(now) - startOfDay(then)) / DAY_MS)
  if (days <= 0) return 'earlier today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  return `on ${then.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}`
}
