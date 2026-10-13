import { useState } from 'react'
import type { Question } from '../data/questions'
import { Button } from './Button'

interface Props {
  question: Question
  onAnswer: (answer: string) => void
}

type Of<K extends Question['kind']> = Extract<Question, { kind: K }>

function Choice({ question, onAnswer }: { question: Of<'choice'>; onAnswer: Props['onAnswer'] }) {
  return (
    <div className="grid gap-2">
      {question.options.map((option, i) => (
        <button
          key={option}
          onClick={() => onAnswer(option)}
          className="group flex cursor-pointer items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-paper transition hover:border-accent/60 hover:bg-accent/10 focus-visible:border-accent focus-visible:outline-none active:scale-[0.99]"
        >
          <span className="font-mono text-xs text-accent/70 group-hover:text-accent">{String.fromCharCode(65 + i)}</span>
          <span>{option}</span>
        </button>
      ))}
    </div>
  )
}

function Slider({ question, onAnswer }: { question: Of<'slider'>; onAnswer: Props['onAnswer'] }) {
  const [value, setValue] = useState(Math.round((question.min + question.max) / 2))
  const unit = value === 1 && question.one ? question.one : question.unit
  return (
    <div>
      <p className="text-center font-display text-5xl font-semibold text-accent tabular-nums">
        {value}
        <span className="ml-1 text-xl font-normal text-haze">{unit.trim()}</span>
      </p>
      <input
        type="range"
        min={question.min}
        max={question.max}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        aria-label={question.text}
        className="mt-5 w-full cursor-pointer accent-accent"
      />
      <div className="mt-1 mb-5 flex justify-between font-mono text-[0.65rem] tracking-[0.15em] text-haze uppercase">
        <span>{question.lo}</span>
        <span>{question.hi}</span>
      </div>
      <Button onClick={() => onAnswer(`${value}${unit}`)}>Lock it in</Button>
    </div>
  )
}

function Text({ question, onAnswer }: { question: Of<'text'>; onAnswer: Props['onAnswer'] }) {
  const [value, setValue] = useState('')
  const answer = value.trim()
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (answer) onAnswer(answer)
      }}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={question.placeholder}
        maxLength={28}
        aria-label={question.text}
        autoComplete="off"
        className="mb-5 w-full border-b border-white/20 bg-transparent py-3 font-display text-2xl text-paper italic placeholder:text-haze/50 focus:border-accent focus:outline-none"
      />
      <Button type="submit" disabled={!answer}>
        Answer
      </Button>
    </form>
  )
}

export function QuestionInput({ question, onAnswer }: Props) {
  switch (question.kind) {
    case 'choice':
      return <Choice question={question} onAnswer={onAnswer} />
    case 'slider':
      return <Slider question={question} onAnswer={onAnswer} />
    case 'text':
      return <Text question={question} onAnswer={onAnswer} />
  }
}
