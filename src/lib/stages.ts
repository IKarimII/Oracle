import type { Place } from './location'

export interface Stage {
  kind: 'hemisphere' | 'continent' | 'country' | 'region' | 'city' | 'locality'
  /** Short name for the trail, e.g. "Asia" */
  label: string
  /** Reads naturally after "you are" */
  where: string
  /** Centre and size of the circle drawn on the map; null means the whole world */
  center: [lat: number, lon: number] | null
  radiusKm: number | null
}

const KM_PER_DEGREE = 111

/**
 * Nudges the circle off the true spot so the early guesses look like guesses.
 * The offset stays well inside the radius, so the real location is always covered.
 */
function wobble(lat: number, lon: number, radiusKm: number): [number, number] {
  const angle = Math.random() * Math.PI * 2
  const km = radiusKm * (0.15 + Math.random() * 0.25)
  const dLat = (km * Math.sin(angle)) / KM_PER_DEGREE
  const dLon = (km * Math.cos(angle)) / (KM_PER_DEGREE * Math.cos((lat * Math.PI) / 180))
  return [Math.max(-60, Math.min(60, lat + dLat)), lon + dLon]
}

/** The order in which we pretend to figure things out. Empty if the lookup failed. */
export function buildStages(place: Place | null): Stage[] {
  const stages: Stage[] = []
  if (!place) return stages

  const { lat, lon } = place
  const located = lat !== null && lon !== null
  const add = (kind: Stage['kind'], label: string, where: string, radiusKm: number) =>
    stages.push({ kind, label, where, radiusKm, center: located ? wobble(lat, lon, radiusKm) : null })

  if (located) {
    const ns = lat >= 0 ? 'Northern' : 'Southern'
    const ew = lon >= 0 ? 'eastern' : 'western'
    add('hemisphere', `${ns} Hemisphere`, `in the ${ns} Hemisphere, ${ew} half`, 4500)
  }

  const named: [Stage['kind'], string, number][] = [
    ['continent', place.continent, 2200],
    ['country', place.country, 450],
    ['region', place.region, 120],
    ['city', place.city, 18],
    ['locality', place.locality, 4],
  ]
  const seen = new Set<string>()
  for (const [kind, name, radiusKm] of named) {
    if (!name || seen.has(name)) continue
    seen.add(name)
    add(kind, name, `in ${name}`, radiusKm)
  }

  // The last guess lands dead on.
  const last = stages[stages.length - 1]
  if (located && last?.center) last.center = [lat, lon]
  return stages
}

/** Index of the stage "unlocked" once `answered` of `total` questions are done. */
export function stageAfter(answered: number, total: number, stageCount: number): number {
  return Math.floor((answered * stageCount) / total) - 1
}
