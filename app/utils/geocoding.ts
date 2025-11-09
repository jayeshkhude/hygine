/**
 * Geocoding utility using OpenStreetMap Nominatim API
 * Free, no API key required, but has rate limiting (1 request per second)
 */

export interface GeocodeResult {
  lat: number
  lng: number
  displayName: string
}

/**
 * Geocode a location string to coordinates
 * @param locationText - Location description (e.g., "Pune, India" or "Central Park, NYC")
 * @returns Promise with coordinates or null if geocoding fails
 */
export async function geocodeLocation(locationText: string): Promise<GeocodeResult | null> {
  if (!locationText || locationText.trim().length === 0) {
    return null
  }

  try {
    // Use Nominatim API (OpenStreetMap's geocoding service)
    // Rate limit: 1 request per second (we'll handle this on the client/server)
    const encodedLocation = encodeURIComponent(locationText.trim())
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedLocation}&limit=1&addressdetails=1`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CityHygieneRiskMonitor/1.0' // Required by Nominatim
      }
    })

    if (!response.ok) {
      console.error('Geocoding API error:', response.statusText)
      return null
    }

    const data = await response.json()

    if (!data || data.length === 0) {
      console.warn('No geocoding results for:', locationText)
      return null
    }

    const result = data[0]
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      displayName: result.display_name || locationText
    }
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

/**
 * Geocode multiple locations with rate limiting
 * @param locations - Array of location strings
 * @param delayMs - Delay between requests in milliseconds (default 1100ms to respect 1 req/sec limit)
 * @returns Promise with array of geocode results (null for failed geocoding)
 */
export async function geocodeLocations(
  locations: string[],
  delayMs: number = 1100
): Promise<(GeocodeResult | null)[]> {
  const results: (GeocodeResult | null)[] = []

  for (let i = 0; i < locations.length; i++) {
    const result = await geocodeLocation(locations[i])
    results.push(result)

    // Rate limiting: wait between requests (except for the last one)
    if (i < locations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  return results
}

/**
 * Batch geocode with error handling
 * Skips locations that fail to geocode
 */
export async function batchGeocode(locations: string[]): Promise<Map<string, GeocodeResult>> {
  const results = new Map<string, GeocodeResult>()
  
  for (const location of locations) {
    const geocoded = await geocodeLocation(location)
    if (geocoded) {
      results.set(location, geocoded)
    }
    // Wait 1.1 seconds between requests to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1100))
  }
  
  return results
}

