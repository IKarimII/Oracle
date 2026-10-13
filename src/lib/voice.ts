import { shuffled } from '../data/questions'
import type { Question } from '../data/questions'
import type { Stage } from './stages'

// A verdict is opener + the question's own lore + an ending, each drawn from its
// own deck, so no sentence is reused within a game and the combinations rarely repeat.
// The tone is deliberately straight: the orb has to sound like it is really inferring.

const OPENERS: ((answer: string) => string)[] = [
  (a) => `“${a}.” Noted.`,
  (a) => `“${a}.” That fits.`,
  (a) => `“${a}.” I thought you might say that.`,
  (a) => `“${a}.” That is the less common answer.`,
  (a) => `“${a}.” Good, that helps.`,
  (a) => `“${a}.” Interesting.`,
  (a) => `“${a}.” That matches what I was seeing.`,
  (a) => `“${a}.” You answered that quickly.`,
  (a) => `“${a}.” That shifts things a little.`,
  (a) => `“${a}.” I see.`,
  (a) => `“${a}.” That is consistent with your earlier answers.`,
  (a) => `“${a}.” Not what most people say.`,
  (a) => `“${a}.” That tells me more than you would think.`,
  (a) => `“${a}.” All right.`,
]

// For a question this visitor has answered in an earlier game.
const CHANGED: ((before: string, now: string) => string)[] = [
  (b, n) => `Last time you told me “${b}.” Now it is “${n}.” Changing your answers does not change where you are.`,
  (b, n) => `“${n}.” It was “${b}” before. I notice these things. It will not move you.`,
  (b, n) => `You said “${b}” last time, and “${n}” today. I see what you are trying.`,
]
const UNCHANGED: ((answer: string) => string)[] = [
  (a) => `“${a}.” The same as last time. At least you are consistent.`,
  (a) => `“${a}.” Again. I remember.`,
  (a) => `“${a}.” You told me that before. I had not forgotten.`,
]

type Ending = (where: string) => string

const CONCLUSIONS: Ending[] = [
  (w) => `That places you ${w}.`,
  (w) => `Taken with your other answers, you are ${w}.`,
  (w) => `Most people who answer the way you have are ${w}.`,
  (w) => `That pattern is typical of people ${w}.`,
  (w) => `I can rule out the rest now. You are ${w}.`,
  (w) => `I was between two possibilities. That settles it: you are ${w}.`,
  (w) => `I am confident now. You are ${w}.`,
  (w) => `I am getting closer. You are ${w}.`,
  (w) => `Everything so far points one way. You are ${w}.`,
  (w) => `That narrows it considerably. You are ${w}.`,
  (w) => `It is becoming clear. You are ${w}.`,
]

const FINALES: Ending[] = [
  (w) => `That was the last piece. You are ${w}.`,
  (w) => `I do not need any more questions. You are ${w}.`,
  (w) => `That is all I needed. You are ${w}.`,
]

// A returning visitor gets the first and last reveal from these instead.
const FAMILIAR_FIRST: Ending[] = [
  (w) => `I remember this part. You are ${w}.`,
  (w) => `We have been here before. You are ${w}.`,
  (w) => `As before: you are ${w}.`,
]
const FAMILIAR_FINALES: Ending[] = [
  (w) => `Different answers, same result. You are still ${w}.`,
  (w) => `It comes out the same every time. You are still ${w}.`,
  (w) => `Nothing has moved. You are still ${w}.`,
]

const FILLERS = [
  'It confirms what I had, but does not narrow it yet.',
  'I am still between two possibilities. One more.',
  'Not enough to move on its own. I will combine it with the next one.',
  'That rules a few places out, though not enough to say more.',
  'I need one more answer before I commit.',
  'I am close to something. Keep going.',
  'That is consistent with where I already had you.',
  'It does not change the picture, but it steadies it.',
  'Two regions still fit. The next answer should separate them.',
  'I will hold on to that. It matters more later.',
  'That removes some doubt. Not all of it.',
  'I want to be sure before I say more.',
]

const THINKING = [
  'Reading the pattern…',
  'Comparing with your earlier answers…',
  'Narrowing the region…',
  'Weighing two possibilities…',
  'Looking closer…',
  'Cross-checking…',
  'Focusing…',
  'Following the thread…',
  'Almost there…',
  'Refining…',
  'Listening…',
  'Checking against what I know…',
]

/** Draws without replacement, reshuffling only once everything has been used. */
function deck<T>(items: readonly T[]): () => T {
  let pile: T[] = []
  return () => {
    if (pile.length === 0) pile = shuffled(items)
    return pile.pop() as T
  }
}

export interface Reading {
  question: Question
  answer: string
  /** What this visitor answered to the same question in an earlier game, if anything */
  previous?: string
  /** The place this answer "revealed", or null if it revealed nothing */
  stage: Stage | null
  isFirst: boolean
  isLast: boolean
}

export interface Voice {
  thinking(): string
  verdict(reading: Reading): string
}

/** `familiar`: this visitor has been through a game before, and the orb lets it show. */
export function createVoice(familiar: boolean): Voice {
  const opener = deck(OPENERS)
  const changed = deck(CHANGED)
  const unchanged = deck(UNCHANGED)
  const conclusion = deck(CONCLUSIONS)
  const finale = deck(familiar ? FAMILIAR_FINALES : FINALES)
  const familiarFirst = deck(FAMILIAR_FIRST)
  const filler = deck(FILLERS)
  const thinking = deck(THINKING)

  return {
    thinking,
    verdict({ question, answer, previous, stage, isFirst, isLast }) {
      const head =
        previous === undefined
          ? `${opener()(answer)} ${question.lore}`
          : previous.toLowerCase() === answer.toLowerCase()
            ? unchanged()(answer)
            : changed()(previous, answer)
      if (!stage) return `${head} ${filler()}`
      const ending = isLast ? finale() : familiar && isFirst ? familiarFirst() : conclusion()
      return `${head} ${ending(stage.where)}`
    },
  }
}
