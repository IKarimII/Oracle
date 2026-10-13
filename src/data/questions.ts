interface Base {
  id: string
  text: string
  /** Why the orb claims this answer is a location signal */
  lore: string
}

export type Question = Base &
  (
    | { kind: 'choice'; options: string[] }
    | {
        kind: 'slider'
        min: number
        max: number
        /** Appended to the number, e.g. " hours" */
        unit: string
        /** Singular form of `unit`, used when the value is 1 */
        one?: string
        lo: string
        hi: string
      }
    | { kind: 'text'; placeholder: string }
  )

// Every question should sound like something that could plausibly hint at where a
// person lives, without ever asking for it outright.
export const QUESTIONS: Question[] = [
  {
    id: 'morning-drink',
    kind: 'choice',
    text: 'What is the first thing you drink in the morning?',
    options: ['Coffee', 'Tea', 'Water', 'Juice'],
    lore: 'Morning drinks are one of the strongest regional habits.',
  },
  {
    id: 'transport',
    kind: 'choice',
    text: 'How do you usually get around?',
    options: ['On foot', 'By car', 'Public transport', 'Bicycle or scooter'],
    lore: 'Transport habits reflect how a place is built.',
  },
  {
    id: 'window',
    kind: 'choice',
    text: 'What do you see from the nearest window?',
    options: ['Other buildings', 'Trees or a garden', 'A street', 'Open sky or hills'],
    lore: 'What surrounds you narrows the kind of place considerably.',
  },
  {
    id: 'dinner-time',
    kind: 'choice',
    text: 'When do you usually eat your evening meal?',
    options: ['Before 6pm', '6 to 8pm', '8 to 10pm', 'After 10pm'],
    lore: 'Meal times shift steadily from one region to the next.',
  },
  {
    id: 'breakfast',
    kind: 'choice',
    text: 'What is breakfast, most days?',
    options: ['Something sweet', 'Something savoury', 'Just a drink', 'I skip it'],
    lore: 'Breakfast habits are deeply regional.',
  },
  {
    id: 'shoes-indoors',
    kind: 'choice',
    text: 'Do you wear shoes inside your home?',
    options: ['Always', 'Never', 'Only when guests are over', 'Slippers'],
    lore: 'That custom divides the world quite cleanly.',
  },
  {
    id: 'night-sounds',
    kind: 'choice',
    text: 'What do you hear at night?',
    options: ['Traffic', 'Almost nothing', 'Neighbours', 'Animals or insects'],
    lore: 'Night sounds say a lot about how dense your area is.',
  },
  {
    id: 'free-afternoon',
    kind: 'choice',
    text: 'Where would you rather spend a free afternoon?',
    options: ['By the sea', 'In the mountains', 'In a city', 'At home'],
    lore: 'Preferences like that usually reflect what is within reach.',
  },
  {
    id: 'season',
    kind: 'choice',
    text: 'Which season do you look forward to most?',
    options: ['Spring', 'Summer', 'Autumn', 'Winter'],
    lore: 'Favourite seasons depend on how harsh the others are where you live.',
  },
  {
    id: 'greeting',
    kind: 'choice',
    text: 'How do you greet a close friend?',
    options: ['A hug', 'A handshake', 'A kiss on the cheek', 'A nod or a wave'],
    lore: 'Greetings are among the clearest cultural markers.',
  },
  {
    id: 'bread',
    kind: 'choice',
    text: 'Which is closest to the bread you eat most?',
    options: ['Sliced loaf', 'Flatbread', 'Baguette or roll', 'I rarely eat bread'],
    lore: 'Staple foods map closely onto geography.',
  },
  {
    id: 'hot-day',
    kind: 'choice',
    text: 'How do you cope with a very hot day?',
    options: ['Air conditioning', 'A fan', 'Open windows', 'It rarely gets that hot'],
    lore: 'That depends directly on your climate.',
  },
  {
    id: 'punctual',
    kind: 'choice',
    text: 'A friend says “see you at eight”. When do you arrive?',
    options: ['A little early', 'Exactly at eight', 'Ten minutes late', 'Half an hour late'],
    lore: 'Attitudes to punctuality are strongly regional.',
  },
  {
    id: 'queue',
    kind: 'choice',
    text: 'Someone cuts in front of you in a queue. What do you do?',
    options: ['Say something', 'Say nothing', 'Give them a look', 'There was no real queue'],
    lore: 'Queueing norms vary a great deal between countries.',
  },
  {
    id: 'drinking-water',
    kind: 'choice',
    text: 'Where does your drinking water come from?',
    options: ['The tap', 'Bottles', 'A filter', 'A delivered tank or dispenser'],
    lore: 'Water habits follow local infrastructure.',
  },
  {
    id: 'spice',
    kind: 'choice',
    text: 'How spicy do you like your food?',
    options: ['Not at all', 'Mild', 'Hot', 'As hot as possible'],
    lore: 'Spice tolerance follows cuisine, and cuisine follows place.',
  },
  {
    id: 'sport',
    kind: 'choice',
    text: 'Which sport do the people around you follow most?',
    options: ['Football', 'Basketball', 'Cricket', 'Something else'],
    lore: 'Popular sports are a strong regional signal.',
  },
  {
    id: 'home-type',
    kind: 'choice',
    text: 'What kind of home do you live in?',
    options: ['An apartment', 'A house', 'A shared place', 'Something else'],
    lore: 'Housing type reflects how built-up an area is.',
  },
  {
    id: 'stars',
    kind: 'choice',
    text: 'How many stars can you see on a clear night?',
    options: ['Hardly any', 'A few', 'Many', 'The whole sky'],
    lore: 'Star visibility is a direct measure of how urban your surroundings are.',
  },
  {
    id: 'date-format',
    kind: 'choice',
    text: 'How do you write a date?',
    options: ['Day first', 'Month first', 'Year first', 'It depends'],
    lore: 'Date formats divide neatly along national lines.',
  },
  {
    id: 'twenty-degrees',
    kind: 'choice',
    text: 'It is 20 degrees outside. How does that feel?',
    options: ['Warm', 'Mild', 'Cold', 'Depends on the unit'],
    lore: 'How people judge temperature depends on what they are used to.',
  },
  {
    id: 'tipping',
    kind: 'choice',
    text: 'At a restaurant, do you leave a tip?',
    options: ['Always', 'Sometimes', 'Rarely', 'Never'],
    lore: 'Tipping customs differ sharply between countries.',
  },
  {
    id: 'week-start',
    kind: 'choice',
    text: 'Which day feels like the start of the week?',
    options: ['Monday', 'Sunday', 'Saturday', 'No particular day'],
    lore: 'The working week starts on different days in different regions.',
  },
  {
    id: 'bedtime',
    kind: 'choice',
    text: 'When do you usually go to sleep?',
    options: ['Before 10pm', '10pm to midnight', 'Midnight to 2am', 'After 2am'],
    lore: 'Sleep schedules follow daylight and local routine.',
  },
  {
    id: 'umbrella',
    kind: 'choice',
    text: 'How often do you carry an umbrella?',
    options: ['Almost always', 'When it looks grey', 'Rarely', 'I do not own one'],
    lore: 'That is close to a direct rainfall reading.',
  },
  {
    id: 'groceries',
    kind: 'choice',
    text: 'Where does most of your food come from?',
    options: ['A supermarket', 'A local market', 'Small shops', 'Delivery'],
    lore: 'Shopping habits reflect the kind of area you live in.',
  },
  {
    id: 'feel-cold',
    kind: 'slider',
    text: 'At what temperature do you start to feel cold?',
    min: -10,
    max: 30,
    unit: '°C',
    lo: 'Hardy',
    hi: 'Easily cold',
    lore: 'Cold tolerance is one of the clearest climate signals.',
  },
  {
    id: 'languages',
    kind: 'slider',
    text: 'How many languages can you hold a conversation in?',
    min: 1,
    max: 6,
    unit: ' languages',
    one: ' language',
    lo: 'One',
    hi: 'Six or more',
    lore: 'Multilingualism is concentrated in particular regions.',
  },
  {
    id: 'sea-distance',
    kind: 'slider',
    text: 'How long would it take you to reach the sea?',
    min: 0,
    max: 12,
    unit: ' hours',
    one: ' hour',
    lo: 'I can see it',
    hi: 'Half a day or more',
    lore: 'Distance from the coast rules out a great deal.',
  },
  {
    id: 'neighbours',
    kind: 'slider',
    text: 'How well do you know your neighbours?',
    min: 0,
    max: 10,
    unit: ' out of 10',
    lo: 'Not at all',
    hi: 'Like family',
    lore: 'Neighbourly closeness varies with culture and density.',
  },
  {
    id: 'midday-sun',
    kind: 'slider',
    text: 'How strong is the sun where you are at midday?',
    min: 0,
    max: 10,
    unit: ' out of 10',
    lo: 'Barely there',
    hi: 'Fierce',
    lore: 'Sun strength follows latitude closely.',
  },
  {
    id: 'journey',
    kind: 'slider',
    text: 'How long is your usual journey to work or school?',
    min: 0,
    max: 120,
    unit: ' minutes',
    one: ' minute',
    lo: 'No journey',
    hi: 'Two hours',
    lore: 'Journey times reflect the size of the place you live in.',
  },
  {
    id: 'street-quiet',
    kind: 'slider',
    text: 'How quiet is your street after dark?',
    min: 0,
    max: 10,
    unit: ' out of 10',
    lo: 'Loud',
    hi: 'Silent',
    lore: 'Evening quiet is a reliable sign of how urban a place is.',
  },
  {
    id: 'relatives',
    kind: 'slider',
    text: 'How many relatives live within an hour of you?',
    min: 0,
    max: 30,
    unit: ' relatives',
    one: ' relative',
    lo: 'None',
    hi: 'Thirty or more',
    lore: 'How close families stay differs strongly by region.',
  },
  {
    id: 'soft-drink',
    kind: 'text',
    text: 'What do you call a fizzy soft drink?',
    placeholder: 'A word',
    lore: 'Words for everyday things are a reliable regional marker.',
  },
  {
    id: 'last-meal',
    kind: 'text',
    text: 'What was the last thing you ate?',
    placeholder: 'A food',
    lore: 'Recent meals reveal local cuisine.',
  },
  {
    id: 'tree',
    kind: 'text',
    text: 'Name a tree that grows near you.',
    placeholder: 'A tree',
    lore: 'Local trees narrow the climate zone considerably.',
  },
  {
    id: 'weather-now',
    kind: 'text',
    text: 'In a word or two, what is the weather doing right now?',
    placeholder: 'The weather',
    lore: 'Current weather rules out large parts of the map.',
  },
  {
    id: 'home-word',
    kind: 'text',
    text: 'What is the first word you think of for “home”?',
    placeholder: 'A word',
    lore: 'Quick word choices reveal first-language habits.',
  },
  {
    id: 'childhood-food',
    kind: 'text',
    text: 'Name a food you ate often as a child.',
    placeholder: 'A food',
    lore: 'Childhood foods are strongly tied to place.',
  },
]

export function shuffled<T>(items: readonly T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

const SEEN_KEY = 'oracle.seen'
// Typing and sliding are fun in small doses.
const MAX_PER_KIND: Record<Question['kind'], number> = { choice: Infinity, slider: 3, text: 2 }

function readSeen(): string[] {
  try {
    const seen: unknown = JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]')
    return Array.isArray(seen) ? seen : []
  } catch {
    return []
  }
}

export function forgetSeen(): void {
  try {
    localStorage.removeItem(SEEN_KEY)
  } catch {
    // Nothing stored, nothing to clear.
  }
}

// How many already-answered questions to ask again, so the orb can catch a changed answer.
const CALLBACKS = 2

/**
 * Picks a mixed set, preferring questions this browser hasn't been asked in earlier games.
 * `recall` lists question ids the visitor has answered before; a couple are deliberately repeated.
 */
export function drawQuestions(count: number, recall: string[] = []): Question[] {
  let seen = readSeen()
  if (QUESTIONS.filter((q) => !seen.includes(q.id)).length < count) seen = []

  const callbacks = shuffled(QUESTIONS.filter((q) => recall.includes(q.id))).slice(0, CALLBACKS)
  const fresh = shuffled(QUESTIONS.filter((q) => !seen.includes(q.id)))
  const stale = shuffled(QUESTIONS.filter((q) => seen.includes(q.id)))
  const picked: Question[] = []
  const used: Record<string, number> = {}
  for (const q of [...callbacks, ...fresh, ...stale]) {
    if (picked.length === count) break
    if (picked.includes(q) || (used[q.kind] ?? 0) >= MAX_PER_KIND[q.kind]) continue
    used[q.kind] = (used[q.kind] ?? 0) + 1
    picked.push(q)
  }

  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...new Set([...seen, ...picked.map((q) => q.id)])]))
  } catch {
    // Storage blocked: repeats across games are possible, nothing else breaks.
  }
  return shuffled(picked)
}
