export interface Place {
  lat: number | null
  lon: number | null
  continent: string
  country: string
  region: string
  city: string
  locality: string
}

interface GeocodeResponse {
  latitude?: number
  longitude?: number
  continent?: string
  countryName?: string
  principalSubdivision?: string
  city?: string
  locality?: string
}

// Called without coordinates, the API locates the caller's IP address.
const GEOCODE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en'

export async function findPlace(): Promise<Place | null> {
  try {
    const res = await fetch(GEOCODE_URL)
    if (!res.ok) return null
    const g: GeocodeResponse = await res.json()
    return {
      lat: g.latitude ?? null,
      lon: g.longitude ?? null,
      continent: g.continent ?? '',
      country: g.countryName ?? '',
      region: g.principalSubdivision ?? '',
      city: g.city ?? '',
      locality: g.locality ?? '',
    }
  } catch {
    return null
  }
}
