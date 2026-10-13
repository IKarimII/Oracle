import { useEffect, useRef, useState } from 'react'
import { Button } from './components/Button'
import { MapBackdrop } from './components/MapBackdrop'
import { QuestionInput } from './components/QuestionInput'
import { Typewriter } from './components/Typewriter'
import { drawQuestions, forgetSeen } from './data/questions'
import type { Question } from './data/questions'
import { findPlace } from './lib/location'
import type { Place } from './lib/location'
import { EMPTY, clearMemory, loadMemory, saveMemory, whenPhrase } from './lib/memory'
import type { Memory } from './lib/memory'
import { buildStages, stageAfter } from './lib/stages'
import type { Stage } from './lib/stages'
import { createVoice } from './lib/voice'
import type { Voice } from './lib/voice'

const QUESTION_COUNT = 10
const WORLD_POPULATION = 8_200_000_000
const WAKING_MS = 1600
const THINKING_MS = 1500
// Secret: pressing Escape this many times in a row wipes the orb's memory of this visitor.
const FORGET_PRESSES = 3
const FORGET_WINDOW_MS = 1500

type Phase = 'intro' | 'waking' | 'quiz' | 'reveal'

/** What the orb knew about this visitor when the current game began. */
interface Visit {
  /** They have finished, abandoned or restarted a game before */
  familiar: boolean
  /** They are somewhere other than where the orb last placed them */
  moved: boolean
  /** Their answers from earlier games, by question id */
  answers: Record<string, string>
}

const STRANGER: Visit = { familiar: false, moved: false, answers: {} }

const addressOf = (place: Place | null) =>
  place ? [...new Set([place.locality, place.city, place.region, place.country].filter(Boolean))] : []

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Candidates left, as a power of ten: falls linearly so the count shrinks geometrically. */
function candidateExponent(answered: number): number {
  return Math.log10(WORLD_POPULATION) * (1 - answered / QUESTION_COUNT)
}

/** Eases a number toward `target` whenever it changes. */
function useTween(target: number, ms = 1400): number {
  const [value, setValue] = useState(target)
  const current = useRef(target)

  useEffect(() => {
    const from = current.current
    const started = performance.now()
    let frame = requestAnimationFrame(function tick(now) {
      const t = Math.min(1, (now - started) / ms)
      current.current = from + (target - from) * (1 - (1 - t) ** 3)
      setValue(current.current)
      if (t < 1) frame = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(frame)
  }, [target, ms])

  return value
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[0.65rem] tracking-[0.25em] text-haze uppercase">{children}</p>
}

/** The opening pitch, which changes once the orb recognises the visitor. */
function greeting(memory: Memory): { title: React.ReactNode; body: string; action: string } {
  const when = whenPhrase(memory.lastSeen)
  if (memory.inProgress)
    return {
      title: (
        <>
          You left before <em className="text-accent">I had finished.</em>
        </>
      ),
      body: `You started this ${when} and walked away. Starting over will not change the answer.`,
      action: 'Start over',
    }
  if (memory.completed > 0)
    return {
      title: (
        <>
          You again. <em className="text-accent">I remember you.</em>
        </>
      ),
      body: `You were last here ${when}${memory.completed > 1 ? `, and ${memory.completed} times in all` : ''}. Ask as often as you like. Different answers will not put you somewhere else.`,
      action: 'Ask again',
    }
  return {
    title: (
      <>
        Ten questions. Then I tell you <em className="text-accent">where you are.</em>
      </>
    ),
    body: 'Answer honestly. The orb reads the pattern in your answers and narrows it down, one question at a time.',
    action: 'Begin',
  }
}

export default function App() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [memory, setMemory] = useState(loadMemory)
  const [visit, setVisit] = useState<Visit>(STRANGER)
  const [place, setPlace] = useState<Place | null>(null)
  const [stages, setStages] = useState<Stage[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [answered, setAnswered] = useState(0)
  const [thinking, setThinking] = useState<string | null>(null)
  const [verdict, setVerdict] = useState<string | null>(null)
  const voice = useRef<Voice | null>(null)

  const playing = phase === 'quiz' || phase === 'reveal'
  const stageIndex = playing ? stageAfter(answered, QUESTION_COUNT, stages.length) : -1
  const stage: Stage | undefined = stages[stageIndex]
  const question = questions[answered]
  const candidates = Math.round(10 ** useTween(candidateExponent(playing ? answered : 0)))
  const address = addressOf(place)

  function remember(next: Memory) {
    saveMemory(next)
    setMemory(next)
  }

  useEffect(() => {
    let presses = 0
    let last = 0
    function onKey(e: KeyboardEvent) {
      const now = performance.now()
      presses = e.key === 'Escape' && now - last < FORGET_WINDOW_MS ? presses + 1 : e.key === 'Escape' ? 1 : 0
      last = now
      if (presses < FORGET_PRESSES) return
      presses = 0
      clearMemory()
      forgetSeen()
      setMemory(EMPTY)
      setVisit(STRANGER)
      setThinking(null)
      setVerdict(null)
      setPhase('intro')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  async function start() {
    const familiar = memory.completed > 0 || memory.inProgress
    const past = memory.answers
    setPhase('waking')
    remember({ ...memory, inProgress: true, lastSeen: new Date().toISOString() })
    const [found] = await Promise.all([findPlace(), wait(WAKING_MS)])
    const moved = familiar && memory.lastPlace !== null && memory.lastPlace !== addressOf(found).join(', ')
    setVisit({ familiar, moved, answers: past })
    // Someone who has moved gets a fresh reading, not "same as before".
    voice.current = createVoice(familiar && !moved)
    setPlace(found)
    setStages(buildStages(found))
    setQuestions(drawQuestions(QUESTION_COUNT, familiar ? Object.keys(past) : []))
    setAnswered(0)
    setVerdict(null)
    setPhase('quiz')
  }

  function answer(text: string) {
    if (!voice.current || !question) return
    const next = answered + 1
    const nextIndex = stageAfter(next, QUESTION_COUNT, stages.length)
    const line = voice.current.verdict({
      question,
      answer: text,
      previous: visit.answers[question.id],
      stage: nextIndex > stageIndex ? stages[nextIndex] : null,
      isFirst: nextIndex === 0,
      isLast: stages.length > 1 && nextIndex === stages.length - 1,
    })
    remember({ ...memory, answers: { ...memory.answers, [question.id]: text } })
    setThinking(voice.current.thinking())
    setTimeout(() => {
      setAnswered(next)
      setVerdict(line)
      setThinking(null)
    }, THINKING_MS)
  }

  function proceed() {
    setVerdict(null)
    if (answered < QUESTION_COUNT) return
    remember({
      ...memory,
      completed: memory.completed + 1,
      inProgress: false,
      lastPlace: place ? address.join(', ') : memory.lastPlace,
    })
    setPhase('reveal')
  }

  const status =
    phase === 'intro'
      ? 'Dormant'
      : phase === 'waking'
        ? 'Waking'
        : phase === 'reveal'
          ? 'Certain'
          : thinking
            ? 'Thinking'
            : verdict
              ? 'Speaking'
              : 'Listening'
  // High but not suspiciously perfect, and stable for a given place.
  const confidence = 94 + (Math.abs(Math.round((place?.lat ?? 0) * 100)) % 5)
  const intro = greeting(memory)

  return (
    <>
      <MapBackdrop
        lat={stage?.center?.[0] ?? null}
        lon={stage?.center?.[1] ?? null}
        radiusKm={stage?.radiusKm ?? null}
        pin={phase === 'reveal'}
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-t from-ink via-ink/30 to-ink/40 lg:bg-gradient-to-r lg:from-ink lg:via-ink/40 lg:to-transparent" />

      <header className="pointer-events-none fixed top-0 left-0 z-10 p-4 font-mono text-xs tracking-[0.3em] text-paper/80 uppercase lg:p-8">
        <span className="mr-2 text-accent">●</span>Oracle
      </header>

      <main className="pointer-events-none relative z-10 flex min-h-dvh flex-col justify-end p-3 lg:justify-center lg:p-8">
        <section
          id="panel"
          className="pointer-events-auto w-full rounded-2xl border border-white/15 bg-ink/90 p-5 shadow-2xl shadow-black/70 backdrop-blur-xl sm:p-7 lg:w-[27rem]"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="orb" data-state={thinking || phase === 'waking' ? 'thinking' : 'idle'} />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[0.65rem] tracking-[0.25em] text-accent uppercase">The Orb</p>
              <Eyebrow>{status}</Eyebrow>
            </div>
            {phase === 'quiz' && (
              <p className="font-mono text-sm text-paper tabular-nums">
                {String(Math.min(answered + 1, QUESTION_COUNT)).padStart(2, '0')}
                <span className="text-haze"> / {QUESTION_COUNT}</span>
              </p>
            )}
          </div>

          {phase === 'intro' && (
            <div className="animate-rise">
              <h1 className="font-display text-4xl leading-[1.05] font-semibold text-paper sm:text-5xl">
                {intro.title}
              </h1>
              <p className="mt-4 mb-7 text-haze">{intro.body}</p>
              <Button onClick={start}>{intro.action}</Button>
            </div>
          )}

          {phase === 'waking' && (
            <p className="animate-pulse py-10 font-display text-2xl text-paper/80 italic">The orb is waking…</p>
          )}

          {phase === 'quiz' && (
            <>
              {thinking ? (
                <p className="animate-pulse py-10 font-display text-2xl text-paper/80 italic">{thinking}</p>
              ) : verdict ? (
                <div key={`verdict-${answered}`} className="animate-rise">
                  <Typewriter text={verdict} className="mb-7 font-display text-2xl leading-snug text-paper italic" />
                  <Button onClick={proceed}>{answered >= QUESTION_COUNT ? 'Hear the verdict' : 'Next question'}</Button>
                </div>
              ) : (
                question && (
                  <div key={question.id} className="animate-rise">
                    <h2 className="mb-6 font-display text-[1.7rem] leading-tight font-semibold text-paper">
                      {question.text}
                    </h2>
                    <QuestionInput question={question} onAnswer={answer} />
                  </div>
                )
              )}

              <div className="mt-6 border-t border-white/10 pt-4">
                <div className="flex gap-1">
                  {questions.map((q, i) => (
                    <span
                      key={q.id}
                      className={`h-1 flex-1 rounded-full transition-colors duration-700 ${i < answered ? 'bg-accent' : 'bg-white/10'}`}
                    />
                  ))}
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-4 font-mono text-[0.65rem] tracking-[0.15em] text-haze uppercase">
                  <span>Candidates</span>
                  <span className="text-sm text-accent tabular-nums">{candidates.toLocaleString('en-US')}</span>
                </div>
                <p className="mt-1 font-mono text-[0.65rem] leading-relaxed tracking-[0.15em] text-haze uppercase">
                  {stageIndex < 0
                    ? 'Location unknown'
                    : stages
                        .slice(0, stageIndex + 1)
                        .map((s) => s.label)
                        .join(' › ')}
                </p>
              </div>
            </>
          )}

          {phase === 'reveal' && (
            <div className="animate-rise">
              <Eyebrow>
                {!place
                  ? 'No reading'
                  : visit.moved
                    ? 'You are now in'
                    : visit.familiar
                      ? 'You are still in'
                      : 'You are in'}
              </Eyebrow>
              <p className="mt-2 font-display text-4xl leading-[1.05] font-semibold text-accent sm:text-5xl">
                {address[0] ?? 'Unclear'}
              </p>
              {address.length > 1 && (
                <p className="mt-2 font-display text-xl text-paper italic">{address.slice(1).join(', ')}</p>
              )}
              {!place && <p className="mt-3 text-haze">The orb could not get a clear reading this time.</p>}
              {place && visit.familiar && (
                <p className="mt-4 text-haze">
                  {visit.moved
                    ? 'You have moved since we last spoke. I noticed. ;)'
                    : 'Nice try. Different answers, same place. You have not moved. ;)'}
                </p>
              )}
              <dl className="mt-6 mb-7 flex justify-between gap-3 border-t border-white/10 pt-4 font-mono text-[0.65rem] tracking-[0.15em] text-haze uppercase">
                <div>
                  <dt>Confidence</dt>
                  <dd className="mt-1 text-sm text-paper">{place ? `${confidence}%` : 'Low'}</dd>
                </div>
                {visit.familiar && (
                  <div>
                    <dt>Asked</dt>
                    <dd className="mt-1 text-sm text-paper">{memory.completed} times</dd>
                  </div>
                )}
                <div>
                  <dt>Position</dt>
                  <dd className="mt-1 text-sm whitespace-nowrap text-paper tabular-nums">
                    {place?.lat != null && place.lon != null
                      ? `${place.lat.toFixed(2)}, ${place.lon.toFixed(2)}`
                      : 'Unclear'}
                  </dd>
                </div>
              </dl>
              <Button onClick={() => setPhase('intro')}>Ask again</Button>
            </div>
          )}
        </section>
      </main>
    </>
  )
}
