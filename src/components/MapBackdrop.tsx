import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'

interface Props {
  /** Centre and radius of the guess circle; any null shows the whole world with no circle */
  lat: number | null
  lon: number | null
  radiusKm: number | null
  /** Show a dot on the exact centre (for the final reveal) */
  pin: boolean
}

interface Geo {
  lat: number
  lon: number
  radiusKm: number
}

/** The circle's animation state. It lives outside React so it can be advanced every frame. */
interface Ring {
  /** Where the circle is right now */
  now: Geo
  /** Where it is heading */
  to: Geo
  /** Where the current move began, or null once it has arrived */
  from: Geo | null
  started: number
}

const WORLD: L.LatLngTuple = [20, 10]
const KM_PER_DEGREE = 111
const FLY_SECONDS = 2.2
// Slightly longer than the flight, so the circle is still settling as the map comes to rest.
const TWEEN_MS = 2400

const worldZoom = () => (window.innerWidth > 1100 ? 3 : 2)
const prefersCalm = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)
const lonSpan = (lat: number, radiusKm: number) => radiusKm / (KM_PER_DEGREE * Math.cos((lat * Math.PI) / 180))

function boundsFor({ lat, lon, radiusKm }: Geo): L.LatLngBounds {
  const dLat = radiusKm / KM_PER_DEGREE
  const dLon = Math.min(170, lonSpan(lat, radiusKm))
  return L.latLngBounds(
    [Math.max(-80, lat - dLat), lon - dLon],
    [Math.min(80, lat + dLat), lon + dLon],
  )
}

/** Keeps the circle clear of the panel, which sits left on desktop and at the bottom on mobile. */
function framing(): L.FitBoundsOptions {
  const panel = document.getElementById('panel')?.getBoundingClientRect()
  if (!panel) return { padding: [40, 40] }
  return window.matchMedia('(min-width: 1024px)').matches
    ? { paddingTopLeft: [panel.right + 48, 72], paddingBottomRight: [64, 64] }
    : { paddingTopLeft: [28, 76], paddingBottomRight: [28, panel.height + 40] }
}

export function MapBackdrop({ lat, lon, radiusKm, pin }: Props) {
  const el = useRef<HTMLDivElement>(null)
  const group = useRef<SVGGElement>(null)
  const circle = useRef<SVGCircleElement>(null)
  const dot = useRef<SVGCircleElement>(null)
  const map = useRef<L.Map | null>(null)
  const ring = useRef<Ring | null>(null)

  useEffect(() => {
    const m = L.map(el.current!, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
      zoomSnap: 0.25,
      minZoom: 1.5,
    }).setView(WORLD, worldZoom())
    L.control.attribution({ position: 'topright', prefix: false }).addTo(m)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(m)
    map.current = m

    // The circle is drawn in screen space and re-projected from the map's live view on
    // every frame. Leaflet's own vector layers only redraw at the end of a zoom animation,
    // which made the circle jump while the map was flying.
    let frame = requestAnimationFrame(function draw(now) {
      frame = requestAnimationFrame(draw)
      const r = ring.current
      if (!r || !circle.current || !dot.current) return
      if (r.from) {
        const t = Math.min(1, (now - r.started) / TWEEN_MS)
        const e = easeInOut(t)
        r.now = {
          lat: r.from.lat + (r.to.lat - r.from.lat) * e,
          lon: r.from.lon + (r.to.lon - r.from.lon) * e,
          // Radii span orders of magnitude, so shrink geometrically.
          radiusKm: r.from.radiusKm * (r.to.radiusKm / r.from.radiusKm) ** e,
        }
        if (t >= 1) r.from = null
      }
      const centre = m.latLngToContainerPoint([r.now.lat, r.now.lon])
      const edge = m.latLngToContainerPoint([r.now.lat, r.now.lon + lonSpan(r.now.lat, r.now.radiusKm)])
      circle.current.setAttribute('cx', centre.x.toFixed(2))
      circle.current.setAttribute('cy', centre.y.toFixed(2))
      circle.current.setAttribute('r', Math.max(0, edge.x - centre.x).toFixed(2))
      const target = m.latLngToContainerPoint([r.to.lat, r.to.lon])
      dot.current.setAttribute('cx', target.x.toFixed(2))
      dot.current.setAttribute('cy', target.y.toFixed(2))
    })

    return () => {
      cancelAnimationFrame(frame)
      m.remove()
      map.current = null
    }
  }, [])

  useEffect(() => {
    const m = map.current
    if (!m || !group.current) return
    const calm = prefersCalm()

    if (lat === null || lon === null || radiusKm === null) {
      // Fade out in place; the last position is kept so it doesn't snap while fading.
      group.current.style.opacity = '0'
      m.flyTo(WORLD, worldZoom(), { duration: 1.6, animate: !calm })
      return
    }

    const to: Geo = { lat, lon, radiusKm }
    const hidden = group.current.style.opacity !== '1'
    // A circle that is just appearing starts a little wide and settles inward as it fades in.
    const from = hidden || !ring.current ? { ...to, radiusKm: radiusKm * 1.35 } : ring.current.now
    ring.current = calm
      ? { now: to, to, from: null, started: 0 }
      : { now: from, to, from, started: performance.now() }
    group.current.style.opacity = '1'
    m.flyToBounds(boundsFor(to), { ...framing(), duration: FLY_SECONDS, easeLinearity: 0.2, animate: !calm })
  }, [lat, lon, radiusKm])

  return (
    <div className="fixed inset-0 z-0">
      <div ref={el} className="h-full w-full" />
      {/* Above Leaflet's panes (which top out at 700), below its controls. */}
      <svg className="pointer-events-none absolute inset-0 z-[800] h-full w-full" aria-hidden>
        <g ref={group} className="opacity-0 transition-opacity duration-1000 ease-out">
          <circle
            ref={circle}
            className="guess-circle"
            fill="rgb(255 255 255 / 0.07)"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
          <circle
            ref={dot}
            r="5"
            fill="#ffffff"
            stroke="#0b0b0c"
            strokeWidth="2"
            className={`transition-opacity duration-700 ${pin ? 'opacity-100' : 'opacity-0'}`}
          />
        </g>
      </svg>
    </div>
  )
}
